#include "script/scriptengine.h"
#include "graphics/window.h"
#include "graphics/texture.h"
#include "system/console.h"
#include "system/file.h"
#include "script/scriptobject.h"
#include "script/scriptargs.h"
#include "graphics/spritebatch.h"
#include "input/keyboard.h"

#include <string>
#include <iostream>
#include <fstream>

using namespace v8;

namespace {

void Include(const FunctionCallbackInfo<Value>& args) 
{
  // Get filename argument and execute it.
  auto filename = ScriptArgs::GetString(args, 0);
  ScriptEngine::GetCurrent().Execute(filename);
}

Handle<ObjectTemplate> CreateGlobalAndSetFunctions(Isolate* isolate)
{
  auto tmpl = ObjectTemplate::New(isolate);

  ScriptObject::BindFunction(tmpl, "include", Include);
  ScriptObject::BindFunction(tmpl, "print", Console::Print);

  return tmpl;
}

Handle<ObjectTemplate> CreateCowyAndSetFunctions(Isolate* isolate)
{
  auto tmpl = ObjectTemplate::New(isolate);

  ScriptObject::BindFunction(tmpl, "Window", Window::New);
  ScriptObject::BindFunction(tmpl, "SpriteBatch", SpriteBatch::New);
  ScriptObject::BindFunction(tmpl, "Texture", Texture::New);
  ScriptObject::BindFunction(tmpl, "SpriteFont", SpriteFont::New);

  return tmpl;
}

Handle<String> ReadFile(std::string filename)
{
  std::string contents = File::ReadAllText(filename);
  return String::NewFromUtf8(Isolate::GetCurrent(), contents.c_str());
}

void PrintStackTrace(TryCatch* tryCatch)
{
  HandleScope scope(Isolate::GetCurrent());
  String::Utf8Value stackTrace(tryCatch->StackTrace());
  if (stackTrace.length() > 0)
    std::cout << *stackTrace << "\n";
}

}

ScriptEngine::ScriptEngine()
{
  // Initialize V8
  V8::InitializeICU();
  platform_ = v8::platform::CreateDefaultPlatform();
  V8::InitializePlatform(platform_);
  V8::Initialize();
}

ScriptEngine::~ScriptEngine()
{
  // Shutdown V8
  V8::Dispose();
  V8::ShutdownPlatform();
  delete platform_;
}

void ScriptEngine::Run(std::string filename)
{
  // Create a new isolate and make it the current one
  Isolate* isolate = Isolate::New();
  {
    Isolate::Scope isolateScope(isolate);

    // Create a handle scope to hold the temporary references
    HandleScope handleScope(isolate);

    // Create cowy and global template objects and set built-in functions.
    auto global = CreateGlobalAndSetFunctions(isolate);
    auto cowy = CreateCowyAndSetFunctions(isolate);

    // Add cowy object to global.
    global->Set(String::NewFromUtf8(isolate, "cowy"), cowy);

    // Enter the new context so all the following operations take place
    // within it.
    auto context = Context::New(isolate, NULL, global);
    Context::Scope contextScope(context);

    // Compile and run the script
    Execute(filename);
  }
}

bool ScriptEngine::Execute(std::string filename)
{
  HandleScope handleScope(Isolate::GetCurrent());

  // Get the script to execute
  auto script = ReadFile(filename);

  // We're just about to compile the script; set up an error handler to
  // catch any exceptions the script might throw.
  TryCatch tryCatch;

  // Compile the script and check for errors.
  auto compiled = Script::Compile(
    script, String::NewFromUtf8(Isolate::GetCurrent(), filename.c_str()));

  if (compiled.IsEmpty()) {
    PrintStackTrace(&tryCatch);
    // The script failed to compile; bail out.
    return false;
  }

  // Run the script!
  auto result = compiled->Run();

  if (result.IsEmpty()) {
    // The TryCatch above is still in effect and will have caught the error.
    PrintStackTrace(&tryCatch);
    // Running the script failed; bail out.
    return false;
  }
  return true;
}

void ScriptEngine::ThrowTypeError(std::string message)
{
  auto isolate = Isolate::GetCurrent();
  isolate->ThrowException(Exception::TypeError(
    String::NewFromUtf8(isolate, message.c_str())));
}