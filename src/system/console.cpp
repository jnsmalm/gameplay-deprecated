#include "system/console.h"
#include "script/scriptengine.h"
#include "script/scriptargs.h"

#include <iostream>

using namespace v8;

void Console::Print(const FunctionCallbackInfo<Value>& args)
{
  bool first = true;
  for (int i = 0; i < args.Length(); i++) {
    HandleScope handleScope(args.GetIsolate());
    if (first) {
      first = false;
    } 
    else {
      std::cout << " ";
    }
    std::cout << *String::Utf8Value(args[i]);
  }
  std::cout << "\n";
}