#ifndef SCRIPTENGINE_H
#define SCRIPTENGINE_H

#include "v8.h"
#include "libplatform/libplatform.h"
#include <string>
#include <vector>

class ScriptEngine {

public:

  // Compile and execute the specified script.
  v8::Handle<v8::Value> Execute(std::string filename);
  // Start running the specified script.
  void Run(std::string filename);
  // Throws the type error exception.
  void ThrowTypeError(std::string message);
  // Gets the execution path for the initial script.
  std::string GetExecutionPath() { return executionPath_; }
  // Gets the current path for the script.
  std::string GetCurrentScriptPath();

  // Gets the singleton instance.
  static ScriptEngine& GetCurrent()
  {
    static ScriptEngine instance;
    return instance;
  }

private:

  // Constructor and destructor is private when singleton.
  ScriptEngine();
  ~ScriptEngine();

  bool AppendScriptPath(std::string filename);
  void RemoveScriptPath();

  // Overload operators to make singleton work as expected.
  ScriptEngine(ScriptEngine const& copy);
  ScriptEngine& operator=(ScriptEngine const& copy);

  v8::Platform* platform_;
  v8::Isolate* isolate_;
  v8::Persistent<v8::ObjectTemplate> global_;
  v8::Persistent<v8::Context> context_;
  std::vector<std::string> folders_;
  std::string executionPath_;
};

#endif