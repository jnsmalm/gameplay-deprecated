#ifndef SCRIPTGLOBAL_H
#define SCRIPTGLOBAL_H

#include "script/scriptobject.h"
#include "script/scripthelper.h"
#include "system/file.h"

#include "v8.h"

class ScriptGlobal : public ScriptObject<ScriptGlobal> {

public:

  static v8::Handle<v8::ObjectTemplate> Create(v8::Isolate* isolate)
  {
    ScriptGlobal global(isolate);
    global.Initialize();
    return global.GetTemplate();
  }

protected:

  void Initialize()
  {
    ScriptObject::Initialize();
    AddFunction("require", Require);
  }

  static void Require(const v8::FunctionCallbackInfo<v8::Value>& args) 
  {
    v8::HandleScope scope(args.GetIsolate());
    ScriptHelper helper(args.GetIsolate());

    try {
      auto filename = helper.GetString(args[0]);
      auto result = ScriptEngine::GetCurrent().Execute(filename);
      args.GetReturnValue().Set(result);
    }
    catch (std::exception& ex) {
      ScriptEngine::GetCurrent().ThrowTypeError(ex.what());
    }
  }

private:

  // Inherit constructors.
  using ScriptObject::ScriptObject;

};

#endif