#ifndef SCRIPTOBJECT_H
#define SCRIPTOBJECT_H

#include "v8.h"
#include <string>

template <typename T>
class ScriptObject {

public:

  void Init(v8::Isolate* isolate)
  {
    isolate_ = isolate;

    auto objectTemplate = v8::ObjectTemplate::New(isolate);
    template_.Reset(isolate, objectTemplate);

    Setup();
  }

  void Init(v8::Isolate* isolate, std::string name, v8::Handle<v8::ObjectTemplate> parent)
  {
    isolate_ = isolate;

    auto objectTemplate = v8::ObjectTemplate::New(isolate);
    objectTemplate->SetInternalFieldCount(1);
    template_.Reset(isolate, objectTemplate);

    Setup();

    // Add constructor to parent object.
    parent->Set(v8::String::NewFromUtf8(isolate, name.c_str()), 
      v8::FunctionTemplate::New(isolate, T::New));
  }

  // Gets the singleton instance.
  static T& GetCurrent()
  {
    static T instance;
    return instance;
  }

  static v8::Handle<v8::ObjectTemplate> GetTemplate()
  {
    return v8::Local<v8::ObjectTemplate>::New(
      GetIsolate(), GetCurrent().template_);
  }

protected:

  // Constructor and destructor is protected when singleton.
  ScriptObject() {}
  ~ScriptObject() {}

  virtual void Setup() = 0;

  // Adds a function to the object template.
  void AddFunction(std::string name, v8::FunctionCallback function)
  {
    v8::HandleScope scope(isolate_);
    auto tmpl = v8::Local<v8::ObjectTemplate>::New(isolate_, template_);
    tmpl->Set(v8::String::NewFromUtf8(isolate_, name.c_str()), 
      v8::FunctionTemplate::New(isolate_, function));
  }

  // Adds a accessor to the object template.
  void AddAccessor(std::string name, v8::AccessorGetterCallback getter)
  {
    v8::HandleScope scope(isolate_);
    auto tmpl = v8::Local<v8::ObjectTemplate>::New(isolate_, template_);
    tmpl->SetAccessor(v8::String::NewFromUtf8(isolate_, name.c_str()), getter);
  }

  // Creates an object from a pointer.
  static v8::Handle<v8::Object> Wrap(void* ptr)
  {
    v8::EscapableHandleScope scope(GetIsolate());
    auto objectTemplate = 
      v8::Local<v8::ObjectTemplate>::New(GetIsolate(), GetCurrent().template_);
    auto object = objectTemplate->NewInstance();
    object->SetInternalField(0, v8::External::New(GetIsolate(), ptr));
    return scope.Escape(object);
  }

  // Gets the pointer from the specified object.
  template <typename U>
  static U* Unwrap(v8::Handle<v8::Object> object)
  {
    v8::HandleScope scope(GetIsolate());
    auto field = v8::Handle<v8::External>::Cast(object->GetInternalField(0));
    return static_cast<U*>(field->Value());
  }

  // Gets an object with the specified name.
  static v8::Handle<v8::Object> GetObject(
    v8::Handle<v8::Object> object, std::string name)
  {
    auto value = GetValue(object, name);
    if (!value->IsObject()) {
      return v8::Object::New(GetIsolate());
    }
    return value->ToObject();
  }

  // Gets an object with the specified name.
  template <typename U> 
  static U* GetObject(
    v8::Handle<v8::Object> parent, std::string name, U* defaultValue = NULL)
  {
    auto object = GetObject(parent, name);
    if (object->InternalFieldCount() == 0) {
      return defaultValue;
    }
    auto external = v8::Handle<v8::External>::Cast(object->GetInternalField(0));
    return static_cast<U*>(external->Value());
  }

  // Gets a number with the specified name.
  static float GetNumber(
    v8::Handle<v8::Object> object, std::string name, float defaultValue = 0)
  {
    auto value = GetValue(object, name);
    if (!value->IsNumber()) {
      return defaultValue;
    }
    return value->NumberValue();
  }

  // Gets a boolean with the specified name.
  static float GetBoolean(
    v8::Handle<v8::Object> object, std::string name, bool defaultValue = false)
  {
    auto value = GetValue(object, name);
    if (!value->IsBoolean()) {
      return defaultValue;
    }
    return value->BooleanValue();
  }

  // Gets a string with the specified name.
  static std::string GetString(v8::Handle<v8::Object> object, 
    std::string name, std::string defaultValue = "")
  {
    auto value = GetValue(object, name);
    if (!value->IsString()) {
      return defaultValue;
    }
    return std::string(*v8::String::Utf8Value(value));
  }

  // Gets a string with the specified name.
  static std::string GetString(
    v8::Handle<v8::Value> value, std::string defaultValue = "")
  {
    if (!value->IsString()) {
      return defaultValue;
    }
    return std::string(*v8::String::Utf8Value(value));
  }

  // Gets a value with the specified name.
  static v8::Handle<v8::Value> GetValue(
    v8::Handle<v8::Object> object, std::string name)
  {
    return object->Get(v8::String::NewFromUtf8(GetIsolate(), name.c_str()));
  }

  static v8::Isolate* GetIsolate()
  {
    return GetCurrent().isolate_;
  }

private:

  // Overload operators to make singleton work as expected.
  ScriptObject<T>(ScriptObject<T> const& copy);
  ScriptObject<T>& operator=(ScriptObject<T> const& copy);

  v8::Persistent<v8::ObjectTemplate> template_;
  v8::Isolate* isolate_;

};

#endif