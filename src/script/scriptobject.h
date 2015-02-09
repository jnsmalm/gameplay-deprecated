#ifndef SCRIPTOBJECT_H
#define SCRIPTOBJECT_H

#include "graphics/types.h"

#include "v8.h"
#include <functional>
#include <string>

class ScriptObject {

public:

  ScriptObject(v8::Isolate* isolate, v8::Handle<v8::Object> object);

  template <typename T> 
  T* GetObject(std::string name)
  {
    auto object = GetObject(object_, name);
    v8::Handle<v8::External> ext = v8::Handle<v8::External>::Cast(
      object->GetInternalField(0));
    return static_cast<T*>(ext->Value());
  }

  // Gets a vector with the specified name.
  Vector2 GetVector2(std::string name, Vector2 defaultValue = Vector2 { 0, 0 });
  // Gets a rectangle with the specified name.
  Rectangle GetRectangle(
    std::string name, Rectangle defaultValue = Rectangle { 0, 0, 0, 0 });
  // Gets a color with the specified name.
  Color GetColor(
    std::string name, Color defaultValue = Color { 1.0f, 1.0f, 1.0f, 1.0f });
  // Gets a number with the specified name.
  float GetNumber(std::string name);
  // Gets a number with the specified name.
  float GetNumber(
    v8::Handle<v8::Object> object, std::string name, float defaultValue = 0);
  // Gets an object with the specified name.
  v8::Handle<v8::Object> GetObject(
    v8::Handle<v8::Object> object, std::string name);
  // Gets a value with the specified name.
  v8::Handle<v8::Value> GetValue(
    v8::Handle<v8::Object> object, std::string name);

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

private:

  v8::Isolate* isolate_;
  v8::Handle<v8::Object> object_;

};

#endif