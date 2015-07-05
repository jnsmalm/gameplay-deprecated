#include <script/script-engine.h>

int main(int argc, char *argv[]) {
    ScriptEngine::current().Run(argv[1], argc, argv);
    return 0;
}