/*The MIT License (MIT)

JSPlay Copyright (c) 2015 Jens Malmborg

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

#include <script/script-engine.h>
#include <audio/audio-manager.h>
#include <gl/glew.h>
#include <glfw/glfw3.h>
#include <memory>
#include <iostream>

int main(int argc, char *argv[]) {
    if (argc == 1) {
        std::cout << "No script was specified." << std::endl;
        return 1;
    }
    std::string filename;
    for (int i=1; i<argc; i++) {
        if (strcmp(argv[i], "--version") == 0) {
            std::cout << "Gameplay v" << GAMEPLAY_VERSION << std::endl;
        } else {
            filename = argv[i];
        }
    }
    if (filename.empty()) {
        return 0;
    }
    if (!glfwInit()) {
        std::cout << "Failed to initialize glfw." << std::endl;
        return 1;
    }
    std::unique_ptr<AudioManager> audio;
    try {
        audio = std::unique_ptr<AudioManager>(new AudioManager(nullptr));
    }
    catch (std::exception& error) {
        //
    }
    try {
        ScriptEngine::current().Run(filename, argc, argv);
    }
    catch (std::exception& error) {
        std::cout << error.what() << std::endl;
        return 1;
    }
    glfwTerminate();
    return 0;
}