#include "system/console.h"
#include "script/scriptobject.h"
#include "script/scripthelper.h"
#include "script/scriptengine.h"

#include <iostream>

using namespace v8;

// Helps with setting up the script object.
class Console::ScriptConsole : public ScriptObject<Console> {

public:

  void Initialize()
  {
    ScriptObject::Initialize();
    AddFunction("log", Log);
  }

protected:

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

private:

  // Inherit constructors.
  using ScriptObject::ScriptObject;

};

void Console::InstallScript(Isolate* isolate, Handle<ObjectTemplate> parent)
{
  ScriptConsole::InstallAsProperty<ScriptConsole>(
    isolate, "console", parent);
}