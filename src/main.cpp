#include "script/scriptengine.h"

int main(int argc, char *argv[])
{
  ScriptEngine::GetCurrent().Run(argv[1]);
  return 0;
}