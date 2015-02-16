#ifndef SCRIPTENGINE_H
#define SCRIPTENGINE_H

#include "v8.h"
#include "libplatform/libplatform.h"
#include <string>

class ScriptEngine {

  class ScriptGlobal;

public:

  // Compile and execute the specified script.
  bool Execute(std::string filename);
  // Start running the specified script.
  void Run(std::string filename);
  // Throws the type error exception.
  void ThrowTypeError(std::string message);

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

  // Initializes the global object.
  v8::Handle<v8::ObjectTemplate> InitGlobal(v8::Isolate* isolate);

  // Overload operators to make singleton work as expected.
  ScriptEngine(ScriptEngine const& copy);
  ScriptEngine& operator=(ScriptEngine const& copy);

  v8::Platform* platform_;
};

#endif