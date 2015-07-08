#include <script/script-engine.h>
#include <audio/audio-manager.h>

int main(int argc, char *argv[]) {
    std::unique_ptr<AudioManager> audio;
    try {
        audio = std::unique_ptr<AudioManager>(new AudioManager(nullptr));
    }
    catch (std::exception& error) {
        //
    }
    ScriptEngine::current().Run(argv[1], argc, argv);
    return 0;
}