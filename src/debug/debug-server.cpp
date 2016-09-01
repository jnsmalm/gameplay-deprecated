/*The MIT License (MIT)

Copyright (c) 2016 Jens Malmborg

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

#include "debug-server.h"
#include <thread>
#include <iostream>
#include <v8.h>

using asio::ip::tcp;

DebugServer::~DebugServer() {
    if (io_service_ != nullptr) {
        io_service_->stop();
    }
    if (runner_ != nullptr) {
        runner_->join();
        delete runner_;
    }
}

void DebugServer::Start(v8::Isolate *isolate) {
    isolate_ = isolate;
    v8::Debug::SetMessageHandler(MessageHandler);
    try {
        runner_ = new std::thread([this] {
            asio::io_service io_service;
            io_service_ = &io_service;

            tcp::socket socket(io_service);
            socket_ = &socket;

            tcp::acceptor acceptor(io_service, tcp::endpoint(tcp::v4(), 5858));
            this->ListenAsync(&acceptor);

            // The run() function blocks until all work has finished and there
            // are no more handlers to be dispatched, or until the io_service
            // has been stopped.
            io_service.run();
            io_service_ = nullptr;
        });
    } catch (std::exception& e) {
        std::cerr << e.what() << std::endl;
    }
}

void DebugServer::ListenAsync(tcp::acceptor *acceptor) {
    acceptor->async_accept(*socket_, [this] (std::error_code err) {
        if (err) {
            return;
        }
        std::string message =
            "Type: connect\r\n"
            "V8-Version: 4.9.385.33\r\n"
            "Protocol-Version: 1\r\n"
            "Embedding-Host: gameplay v0.6.0\r\n"
            "Content-Length: 0\r\n\r\n";
        asio::write(*socket_, asio::buffer(message), err);
        this->ReadHeaderAsync();
    });
    std::cout << "Debugger listening on port 5858" << std::endl;
}

void DebugServer::ReadHeaderAsync() {
    messageBody_.str("");
    asio::async_read(*socket_, asio::buffer(buffer_, 40),
        [this] (std::error_code err, std::size_t length) {
            if (err) {
                return;
            }
            std::string header(buffer_.data(), length);
            int contentLength = this->ParseContentLength(header);
            std::size_t bodyStart = header.find_first_of("{");
            std::string firstPartOfBody =
                    header.substr(bodyStart, std::string::npos);
            messageBody_ << firstPartOfBody;
            messageBodyBytesToRead_ = contentLength - firstPartOfBody.length();
            this->ReadBodyAsync(messageBodyBytesToRead_);
        });
}

void DebugServer::ReadBodyAsync(std::size_t bytesToRead) {
    asio::async_read(*socket_, asio::buffer(buffer_, bytesToRead),
        [this] (std::error_code err, std::size_t length) {
            if (err) {
                return;
            }
            std::string body(buffer_.data(), length);
            messageBody_ << body;
            messageBodyBytesToRead_ -= length;
            if (messageBodyBytesToRead_ == 0) {
                this->SendDebugCommand(messageBody_.str());
                this->ReadHeaderAsync();
            } else {
                this->ReadBodyAsync(messageBodyBytesToRead_);
            }
        });
}

void DebugServer::SendClientMessage(std::string message) {
    if (socket_ == nullptr) {
        return;
    }
    std::string header("Content-Length: " +
        std::to_string(message.length()) + "\r\n\r\n");
    asio::error_code err;
    asio::write(*socket_, asio::buffer(header + message), err);
}

void DebugServer::SendDebugCommand(std::string command) {
    size_t size = command.size();
    std::vector<uint16_t> data(size);
    for(size_t i = 0; i < size; ++i) {
        data[i] = static_cast<uint16_t>(command[i]);
    }
    v8::Debug::SendCommand(
        isolate_, &data[0], static_cast<int>(data.size()));
}

void DebugServer::MessageHandler(const v8::Debug::Message &message) {
    std::string clientMessage(*v8::String::Utf8Value(message.GetJSON()));
    DebugServer::current().SendClientMessage(clientMessage);
}

int DebugServer::ParseContentLength(std::string header) {
    // Header format: Content-Length: 64\r\n\r\n
    std::size_t begin = header.find_first_of(":");
    std::size_t end = header.find_first_of("\r", begin);
    std::string content_length = header.substr(begin+2, end-begin-2);
    return std::stoi(content_length);
}