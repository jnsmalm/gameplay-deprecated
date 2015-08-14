/*The MIT License (MIT)

Copyright (c) 2015 Jens Malmborg

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.*/

#ifndef GAMEPLAY_SCRIPTDEBUG_H
#define GAMEPLAY_SCRIPTDEBUG_H

#include <v8-debug.h>
#include <vector>
#include <iostream>
#include <thread>
#include "scripthelper.h"
#include <document.h>
#include <filewritestream.h>
#include <prettywriter.h>
#include <filereadstream.h>
#include <iomanip>
#include <sstream>
#include <mutex>
#include <condition_variable>

class ScriptDebugClientData : public v8::Debug::ClientData
{
public:
    ScriptDebugClientData(int sourceLine, int sourceColumn) :
            sourceLine_(sourceLine), sourceColumn_(sourceColumn) { }

    int sourceLine_;
    int sourceColumn_;
};

class ScriptDebug {

public:
    static ScriptDebug& current() {
        static ScriptDebug instance;
        return instance;
    }

    void Start(v8::Isolate *isolate) {
        v8::Debug::SetMessageHandler(MessageHandler);
        debugInput_ = new std::thread(AsyncDebugPrompt, isolate);
    }

    void Stop() {
        debugInputStopped_ = true;
        debugInputCondition_.notify_one();
    }

private:
    ScriptDebug() {
    }

    ~ScriptDebug() {
        if (debugInput_ != nullptr) {
            debugInput_->join();
            delete debugInput_;
        }
    }

    // Makes singleton work as expected.
    ScriptDebug(ScriptDebug const& copy);
    ScriptDebug& operator=(ScriptDebug const& copy);

    void SendContinueCommand(v8::Isolate *isolate, std::string action = "") {
        if (action == "") {
            SendCommand("{\"seq\":117,\"type\":\"request\",\"command\":\"continue\"}", isolate);
        } else {
            SendCommand("{\"seq\":119,\"type\":\"request\",\"command\":\"continue\",\"arguments\":{\"stepaction\":\"" + action + "\",\"stepcount\":1}}", isolate);
        }
    }

    void SendEvaluateCommand(v8::Isolate *isolate, std::string cmd) {
        SendCommand("{\"seq\":117,\"type\":\"request\",\"command\":\"evaluate\",\"arguments\":{\"expression\":\"" + cmd + "\"}}", isolate);
    }

    void SendSourceCommand(
            v8::Isolate *isolate, int sourceLine, int sourceColumn) {
        auto data = new ScriptDebugClientData(sourceLine, sourceColumn);
        SendCommand("{\"seq\":117,\"type\":\"request\",\"command\":\"source\",\"arguments\":{\"fromLine\":" + std::to_string(
                sourceLine - 2) + ",\"toLine\":" + std::to_string(sourceLine + 3) + "}}", isolate, data);
    }

    void SendCommand(std::string cmd, v8::Isolate* isolate,
                     ScriptDebugClientData* clientData = NULL) {
        size_t s = cmd.size();
        // Convert the json request to something that v8 wants.
        std::vector<uint16_t> data(s);
        for(size_t i = 0; i < s; ++i) {
            data[i] = static_cast<uint16_t>(cmd[i]);
        }
        // The response for this command is handled in MessageHandler.
        v8::Debug::SendCommand(
                isolate, &data[0], static_cast<int>(data.size()), clientData);
    }

    static void MessageHandler(const v8::Debug::Message& message) {
        ScriptHelper helper(message.GetIsolate());
        if (message.GetEvent() != v8::DebugEvent::Break) {
            return;
        }
        rapidjson::Document json;
        json.Parse(helper.GetString(message.GetJSON()).c_str());
        if (message.IsEvent()) {
            auto event = std::string(json["event"].GetString());
            if (event == "break") {
                ScriptDebug::current().HandleBreakEvent(message, json);
            }
        }
        if (message.IsResponse()) {
            auto command = std::string(json["command"].GetString());
            if (command == "evaluate") {
                ScriptDebug::current().HandleEvaluateResponse(message, json);
            }
            if (command == "source") {
                ScriptDebug::current().HandleSourceResponse(message, json);
            }
        }
    }

    /*void PrintJson(const rapidjson::Document &json) {
        rapidjson::StringBuffer buffer;
        rapidjson::PrettyWriter<rapidjson::StringBuffer> writer(buffer);
        json.Accept(writer);
        std::cout << buffer.GetString() << std::endl;
    }*/

    void HandleBreakEvent(const v8::Debug::Message &message,
                          const rapidjson::Document &json) {
        auto name = json["body"]["script"]["name"].GetString();
        auto line = json["body"]["sourceLine"].GetInt();
        auto column = json["body"]["sourceColumn"].GetInt();
        std::cout << "break at " <<
                     name << ":" << line + 1 << std::endl;
        // When a break occurs we send a command to get the current source.
        current().SendSourceCommand(message.GetIsolate(), line, column);
    }

    void HandleSourceResponse(const v8::Debug::Message &message,
                              const rapidjson::Document &json) {

        auto fromLine = json["body"]["fromLine"].GetInt() + 1;
        auto source = std::string(json["body"]["source"].GetString());

        ScriptDebugClientData* clientData = static_cast<ScriptDebugClientData*>(
                message.GetClientData());

        std::stringstream stream(source);
        std::string to;
        // Go through the sourcecode and print every sourceline.
        while(std::getline(stream,to,'\n')){
            PrintSourceLine(fromLine++, clientData, to);
        }
        if (!message.WillStartRunning()) {
            current().EnableDebugInput();
        }
    }

    void PrintSourceLine(int sourceLine,
                         const ScriptDebugClientData *clientData,
                         const std::string &source) const {

        if (clientData->sourceLine_ + 1 != sourceLine) {
            // We're not printing the current source line, it's more simple.
            std::cout << std::setw(1) << "";
            std::cout << std::setw(2) << sourceLine << " " << source;
            std::cout << std::endl;
            return;
        }

        std::cout << std::setw(1) << ">";
        std::cout << std::setw(2) << sourceLine << " ";

        // Find the semicolon on this line. If it doesn't exist, use end
        // of the line instead.
        int semicolon = source.find(";", clientData->sourceColumn_ + 1);
        if (semicolon == std::string::npos) {
            semicolon = source.length() - 1;
        }

        // Print the statement before current statement (may be empty).
        std::cout << source.substr(0, clientData->sourceColumn_);
        // Change color to green to highlight current statement.
        std::cout << "\033[32m";
        // Print the current statement.
        std::cout << source.substr(clientData->sourceColumn_,
                                   semicolon - clientData->sourceColumn_);
        // Reset color.
        std::cout << "\033[0m";
        // Print the next statement (may be empty).
        std::cout << source.substr(semicolon, source.length() - semicolon);
        std::cout << std::endl;
    }

    void HandleEvaluateResponse(const v8::Debug::Message &message,
                                const rapidjson::Document &json) {
        if (json.HasMember("body")) {
            // The text for the evaluated response is in body/text.
            std::cout << json["body"]["text"].GetString() << std::endl;
        }
        if (json.HasMember("message")) {
            // The evaluation probably resulted in an error.
            std::cout << json["message"].GetString() << std::endl;
        }
        if (!message.WillStartRunning()) {
            current().EnableDebugInput();
        }
    }

    static void AsyncDebugPrompt(v8::Isolate *isolate) {
        while (true) {
            // This will run in a thread. It waits until something notifies the
            // debug prompt to wake up and take input from the user.
            WaitForDebugInputEnabledOrStopped();
            if (ScriptDebug::current().debugInputStopped_) {
                // We are done debugging.
                break;
            }
            ScriptDebug::current().GetDebugInput(isolate);
            ScriptDebug::current().debugInputEnabled_ = false;
        }
    }

    void EnableDebugInput() {
        ScriptDebug::current().debugInputEnabled_ = true;
        ScriptDebug::current().debugInputCondition_.notify_one();
    }

    static void WaitForDebugInputEnabledOrStopped() {
        std::unique_lock<std::mutex> l(ScriptDebug::current().debugInputMutex_);
        ScriptDebug::current().debugInputCondition_.wait(l, [] {
            return ScriptDebug::current().debugInputEnabled_ ||
                   ScriptDebug::current().debugInputStopped_;
        });
    }

    void GetDebugInput(v8::Isolate *isolate) {
        std::string input;
        std::cout << "debug> "; std::getline(std::cin, input);
        if (input == "") {
            input = previousInput_;
        }
        if (input == "cont") {
            SendContinueCommand(isolate);
            previousInput_ = input;
        }
        else if (input == "next") {
            SendContinueCommand(isolate, "next");
            previousInput_ = input;
        }
        else if (input == "in") {
            SendContinueCommand(isolate, "in");
            previousInput_ = input;
        }
        else if (input == "out") {
            SendContinueCommand(isolate, "out");
            previousInput_ = input;
        }
        else {
            SendEvaluateCommand(isolate, input);
        }
    }

    std::string previousInput_ = "next";
    std::thread* debugInput_ = nullptr;
    std::mutex debugInputMutex_;
    std::condition_variable debugInputCondition_;
    bool debugInputStopped_;
    bool debugInputEnabled_;
};

#endif //GAMEPLAY_SCRIPTDEBUG_H
