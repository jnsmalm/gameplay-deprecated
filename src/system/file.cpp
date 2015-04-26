#include "system/file.h"
#include "script/scriptobject.h"
#include "script/scripthelper.h"
#include "script/scriptengine.h"

#include <fstream>

using namespace v8;

// Helps with setting up the script object.
class File::ScriptFile : public ScriptObject<File> {

public:

  void Initialize()
  {
    ScriptObject::Initialize();
    AddFunction("readText", ReadText);
  }

protected:

  static void ReadText(const v8::FunctionCallbackInfo<v8::Value>& args) 
  {
    v8::HandleScope scope(args.GetIsolate());
    ScriptHelper helper(args.GetIsolate());

    auto filename = ScriptEngine::GetCurrent().GetExecutionPath() + 
      helper.GetString(args[0]);

    try {
      auto text = File::ReadText(filename);
      auto result = v8::String::NewFromUtf8(args.GetIsolate(), text.c_str());
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

std::string File::ReadText(std::string filename)
{
  // Read everything in the specified file
  std::ifstream in { filename };
  if (!in) {
    throw std::runtime_error("Failed to read file '" + filename + "'");
  }
  std::string contents((std::istreambuf_iterator<char>(in)),
    std::istreambuf_iterator<char>());
  return contents;
}

void File::InstallScript(Isolate* isolate, Handle<ObjectTemplate> parent)
{
  ScriptFile::InstallAsProperty<ScriptFile>(
    isolate, "File", parent);
}