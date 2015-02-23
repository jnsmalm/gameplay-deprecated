#include "script/scriptengine.h"
#include "script/scriptobject.h"
#include "system/file.h"
#include "input/keyboard.h"
#include "graphics/spritebatch.h"
#include "graphics/window.h"
#include "graphics/texture.h"

#include <string>
#include <iostream>
#include <numeric>

using namespace v8;

namespace {

Handle<String> ReadFile(std::string filename)
{
  std::string contents = File::ReadAllText(filename);
  return String::NewFromUtf8(Isolate::GetCurrent(), contents.c_str());
}

void PrintStackTrace(TryCatch* tryCatch)
{
  HandleScope scope(Isolate::GetCurrent());
  String::Utf8Value stackTrace(tryCatch->StackTrace());
  if (stackTrace.length() > 0) {
    std::cout << *stackTrace << "\n";
  }
}

std::string GetFilePath(std::string filename)
{
  auto index = filename.find_last_of("\\/");
  if (index == std::string::npos) {
    return "";
  }
  return filename.substr(0, index + 1);
}

}

class ScriptEngine::ScriptGlobal : public ScriptObject<ScriptGlobal> {

public:

  void Setup()
  {
    AddFunction("include", Include);
    AddFunction("print", Print);
  }

  static void Include(const FunctionCallbackInfo<Value>& args) 
  {
    auto filename = GetString(args[0]);
    auto result = ScriptEngine::GetCurrent().Execute(filename);
    args.GetReturnValue().Set(result);
  }

  static void Print(const FunctionCallbackInfo<Value>& args)
  {
    bool first = true;
    for (int i = 0; i < args.Length(); i++) {
      HandleScope scope(args.GetIsolate());
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

};

ScriptEngine::ScriptEngine()
{
  V8::InitializeICU();
  platform_ = v8::platform::CreateDefaultPlatform();
  V8::InitializePlatform(platform_);
  V8::Initialize();
}

ScriptEngine::~ScriptEngine()
{
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
    HandleScope handleScope(isolate);

    auto global = InitGlobal(isolate);

    // Enter the new context so all the following operations take place
    // within it.
    auto context = Context::New(isolate, NULL, global);
    context_.Reset(isolate, context);

    executionPath_ = GetFilePath(filename);

    // Compile and run the script
    Execute(filename);
  }
}

Handle<Value> ScriptEngine::Execute(std::string filename)
{
  filename = GetCurrentScriptPath() + filename;
  auto pathWasPushed = PushScriptPath(filename);

  // Every script gets it's own context.
  Context::Scope contextScope(
    Local<Context>::New(Isolate::GetCurrent(), context_));

  EscapableHandleScope handleScope(Isolate::GetCurrent());

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
    if (pathWasPushed) {
      PopScriptPath();
    }
    return v8::Null(Isolate::GetCurrent());
  }

  // Run the script!
  auto result = compiled->Run();

  if (result.IsEmpty()) {
    PrintStackTrace(&tryCatch);
    if (pathWasPushed) {
      PopScriptPath();
    }
    return v8::Null(Isolate::GetCurrent());
  }

  if (pathWasPushed) {
    PopScriptPath();
  }  

  return handleScope.Escape(result);
}

void ScriptEngine::ThrowTypeError(std::string message)
{
  auto isolate = Isolate::GetCurrent();
  isolate->ThrowException(Exception::TypeError(
    String::NewFromUtf8(isolate, message.c_str())));
}

bool ScriptEngine::PushScriptPath(std::string filename)
{
  auto index = filename.find_last_of("\\/");
  if (index == std::string::npos) {
    return false;
  }
  auto path = filename.substr(0, index + 1);
  auto last = folders_.empty() ? "" : folders_.back();
  if (path != last) {
    folders_.push_back(path);
    return true;
  }
  return false;
}

void ScriptEngine::PopScriptPath()
{
  if (!folders_.empty()) {
    folders_.pop_back();
  }
}

std::string ScriptEngine::GetCurrentScriptPath()
{
  return std::accumulate(folders_.begin(), folders_.end(), std::string(""));
}

Handle<ObjectTemplate> ScriptEngine::InitGlobal(Isolate* isolate)
{
  // Initialize the global object.
  ScriptGlobal::GetCurrent().Init(isolate);
  auto global = ScriptGlobal::GetTemplate();

  // Create namespace.
  auto ns = ObjectTemplate::New(isolate);

  Window::Init(isolate, ns);
  SpriteBatch::Init(isolate, ns);
  SpriteFont::Init(isolate, ns);
  Texture::Init(isolate, ns);

  // Add namespace to global.
  global->Set(String::NewFromUtf8(isolate, "cowy"), ns);

  return global;
}