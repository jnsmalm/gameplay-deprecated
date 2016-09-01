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

#ifndef GAMEPLAY_DEBUGSERVER_H
#define GAMEPLAY_DEBUGSERVER_H

#include <v8-debug.h>
#include <string>
#include <sstream>
#include <asio.hpp>
#include <thread>

class DebugServer {
public:
    static DebugServer& current() {
        static DebugServer instance;
        return instance;
    }
    void Start(v8::Isolate *isolate);

private:
    DebugServer() {}
    DebugServer(DebugServer const& copy);
    ~DebugServer();

    DebugServer& operator=(DebugServer const& copy);

    void ListenAsync(asio::ip::tcp::acceptor *acceptor);
    int ParseContentLength(std::string header);
    void ReadHeaderAsync();
    void ReadBodyAsync(std::size_t bytesToRead);
    void SendClientMessage(std::string message);
    void SendDebugCommand(std::string command);
    static void MessageHandler(const v8::Debug::Message& message);

    std::array<char, 1024> buffer_;
    int messageBodyBytesToRead_;
    std::stringstream messageBody_;
    v8::Isolate *isolate_;
    std::thread *runner_;
    asio::io_service *io_service_;
    asio::ip::tcp::socket *socket_;
};

#endif