#include <script/script-engine.h>
#include <audio/audio-manager.h>
#include <gl/glew.h>
#include <glfw/glfw3.h>

int main(int argc, char *argv[]) {
    if (!glfwInit()) {
        //
    }
    std::unique_ptr<AudioManager> audio;
    try {
        audio = std::unique_ptr<AudioManager>(new AudioManager(nullptr));
    }
    catch (std::exception& error) {
        //
    }
    ScriptEngine::current().Run(argv[1], argc, argv);
    glfwTerminate();
    return 0;
}