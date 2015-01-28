#ifndef CONSOLE_H
#define CONSOLE_H

#include "v8.h"

class Console {

public:

  // Prints the specified arguments to std output.
  static void Print(const v8::FunctionCallbackInfo<v8::Value>& args);

};

#endif