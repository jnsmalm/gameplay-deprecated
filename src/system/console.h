#ifndef CONSOLE_H
#define CONSOLE_H

#include "v8.h"

class Console {

  // Class that is only available to console.
  class ScriptConsole;

public:

  static void InstallScript(
    v8::Isolate* isolate, v8::Handle<v8::ObjectTemplate> global);

};

#endif