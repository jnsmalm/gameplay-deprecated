#ifndef SCRIPTGLOBAL_H
#define SCRIPTGLOBAL_H

#include "script/scriptobject.h"
#include "system/file.h"

#include "v8.h"
#include <iostream>

class ScriptGlobal : public ScriptObject<ScriptGlobal> {

protected:

  void Setup()
  {
    AddFunction("include", Include);
    AddFunction("log", Log);
    AddFunction("readTextFile", ReadTextFile);
  }

  static void Include(const v8::FunctionCallbackInfo<v8::Value>& args) 
  {
    v8::HandleScope scope(args.GetIsolate());
    try {
      auto filename = GetString(args[0]);
      auto result = ScriptEngine::GetCurrent().Execute(filename);
      args.GetReturnValue().Set(result);
    }
    catch (std::exception& ex) {
      ScriptEngine::GetCurrent().ThrowTypeError(ex.what());
    }
  }

  static void Log(const v8::FunctionCallbackInfo<v8::Value>& args)
  {
    bool first = true;
    for (int i = 0; i < args.Length(); i++) {
      v8::HandleScope scope(args.GetIsolate());
      if (first) {
        first = false;
      } 
      else {
        std::cout << " ";
      }
      std::cout << *v8::String::Utf8Value(args[i]);
    }
    std::cout << std::endl;
  }

  static void ReadTextFile(const v8::FunctionCallbackInfo<v8::Value>& args) 
  {
    v8::HandleScope scope(args.GetIsolate());
    try {
      auto filename = GetString(args[0]);
      filename = ScriptEngine::GetCurrent().GetExecutionPath() + filename;
      auto text = File::ReadAllText(filename);
      auto result = v8::String::NewFromUtf8(GetIsolate(), text.c_str());
      args.GetReturnValue().Set(result);
    }
    catch (std::exception& ex) {
      ScriptEngine::GetCurrent().ThrowTypeError(ex.what());
    }
  }

};

#endif