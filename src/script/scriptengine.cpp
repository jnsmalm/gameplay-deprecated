#include "script/scriptengine.h"
#include "script/scriptglobal.h"
#include "system/console.h"
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

Handle<String> ReadFile(Isolate* isolate, std::string filename)
{
  std::string contents = File::ReadText(filename);
  return String::NewFromUtf8(isolate, contents.c_str());
}

void PrintStackTrace(Isolate* isolate, TryCatch* tryCatch)
{
  HandleScope scope(isolate);
  String::Utf8Value stackTrace(tryCatch->StackTrace());
  if (stackTrace.length() > 0) {
    std::cout << *stackTrace << std::endl;
  }
}

void PrintCompileError(Isolate* isolate, TryCatch* tryCatch)
{
  HandleScope scope(isolate);
  
  auto message = tryCatch->Message();
  String::Utf8Value exception(tryCatch->Exception());
  String::Utf8Value filename(message->GetScriptOrigin().ResourceName());

  std::cout << *exception << std::endl;
  std::cout << "    " << "at " << *filename << ":" << 
    message->GetLineNumber() << ":" << message->GetStartColumn() << std::endl;
}

std::string GetFilePath(std::string filename)
{
  auto index = filename.find_last_of("\\/");
  if (index == std::string::npos) {
    return "";
  }
  return filename.substr(0, index + 1);
}

Handle<ObjectTemplate> InstallGlobalScript(Isolate* isolate)
{
  auto global = ScriptGlobal::Create(isolate);

  Window::InstallScript(isolate, global);
  SpriteBatch::InstallScript(isolate, global);
  SpriteFont::InstallScript(isolate, global);
  Texture::InstallScript(isolate, global);
  File::InstallScript(isolate, global);
  Console::InstallScript(isolate, global);

  return global;
}

Handle<Object> InstallModule(Isolate* isolate, Handle<Object> global)
{
  auto module = Object::New(isolate);
  global->Set(String::NewFromUtf8(isolate, "module"), module);
  auto exports = Object::New(isolate);
  module->Set(String::NewFromUtf8(isolate, "exports"), exports);
  return module;
}

}

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
    isolate_ = isolate;

    Isolate::Scope isolateScope(isolate);
    HandleScope handleScope(isolate);

    global_.Reset(isolate, InstallGlobalScript(isolate_));

    /*auto global = ObjectTemplate::New(isolate);
    global->Set(String::NewFromUtf8(isolate, "ko"), 
      InstallGlobalScript(isolate));*/

    //auto global = InstallGlobalScript(isolate);

    // Enter the new context so all the following operations take place
    // within it.
    //auto context = Context::New(isolate, NULL, global);
    //context_.Reset(isolate, context);

    executionPath_ = GetFilePath(filename);

    // Compile and run the script
    Execute(filename);
  }
}

Handle<Value> ScriptEngine::Execute(std::string filename)
{
  auto filepath = GetCurrentScriptPath() + filename;
  auto appended = AppendScriptPath(filename);

  auto global = Local<ObjectTemplate>::New(isolate_, global_);

  // Enter the new context so all the following operations take place
  // within it.
  auto context = Context::New(isolate_, NULL, global);
  //context_.Reset(isolate, context);

  // Every script gets it's own context.
  Context::Scope contextScope(
    Local<Context>::New(isolate_, context));

  EscapableHandleScope handleScope(isolate_);

  auto module = InstallModule(isolate_, context->Global());

  // Get the script to execute
  auto script = ReadFile(isolate_, filepath);

  // We're just about to compile the script; set up an error handler to
  // catch any exceptions the script might throw.
  TryCatch tryCatch;

  // Compile the script and check for errors.
  auto compiled = Script::Compile(
    script, String::NewFromUtf8(isolate_, filename.c_str()));

  if (compiled.IsEmpty()) {
    PrintCompileError(isolate_, &tryCatch);
    if (appended) {
      RemoveScriptPath();
    }
    return v8::Null(isolate_);
  }

  // Run the script!
  auto result = compiled->Run();

  /*auto module = result->Get(String::NewFromUtf8(isolate_, "module"));*/
  auto exports = module->Get(String::NewFromUtf8(isolate_, "exports"));

  if (result.IsEmpty()) {
    PrintStackTrace(isolate_, &tryCatch);
    if (appended) {
      RemoveScriptPath();
    }
    return v8::Null(isolate_);
  }

  if (appended) {
    RemoveScriptPath();
  }  

  return handleScope.Escape(exports);
}

void ScriptEngine::ThrowTypeError(std::string message)
{
  isolate_->ThrowException(Exception::TypeError(
    String::NewFromUtf8(isolate_, message.c_str())));
}

bool ScriptEngine::AppendScriptPath(std::string filename)
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

void ScriptEngine::RemoveScriptPath()
{
  if (!folders_.empty()) {
    folders_.pop_back();
  }
}

std::string ScriptEngine::GetCurrentScriptPath()
{
  return std::accumulate(folders_.begin(), folders_.end(), std::string(""));
}