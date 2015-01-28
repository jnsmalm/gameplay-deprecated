#ifndef SCRIPTOBJECT_H
#define SCRIPTOBJECT_H

#include "v8.h"
#include <functional>

class ScriptObject {

public:

  // Wraps tbe specified pointer to a v8 script object.
  template <typename T> 
  static v8::Handle<v8::Object> Wrap(
    T* obj, std::function<void(const v8::Local<v8::ObjectTemplate>)> setup)
  {
    auto isolate = v8::Isolate::GetCurrent();
    v8::EscapableHandleScope scope(isolate);

    auto tmpl = v8::ObjectTemplate::New(isolate);
    tmpl->SetInternalFieldCount(1);

    if (setup != NULL)
      setup(tmpl);

    auto result = tmpl->NewInstance();
    result->SetInternalField(0, v8::External::New(isolate, obj));

    return scope.Escape(result);
  }

  // Unwraps the specified v8 object to a pointer.
  template <typename T> 
  static T* Unwrap(v8::Handle<v8::Object> object)
  {
    v8::HandleScope scope(v8::Isolate::GetCurrent());
    auto field = v8::Handle<v8::External>::Cast(object->GetInternalField(0));
    auto ptr = field->Value();
    return static_cast<T*>(ptr);
  }

  // Binds a function to the specified object template.
  static void BindFunction(v8::Handle<v8::ObjectTemplate> tmpl, 
    const char* name, v8::FunctionCallback function);

  // Binds a property to the specified object template.
  static void BindProperty(v8::Handle<v8::ObjectTemplate> tmpl, 
    const char* name, v8::AccessorGetterCallback getter);
};

#endif