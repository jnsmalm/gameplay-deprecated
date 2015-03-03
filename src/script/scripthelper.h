#ifndef SCRIPTHELPER_H
#define SCRIPTHELPER_H

#include "graphics/types.h"

#include "v8.h"
#include <string>

class ScriptHelper {

  template <typename T> 
  using Handle = v8::Handle<T>;
  using Value = v8::Value;
  using Object = v8::Object;
  using String = v8::String;
  using External = v8::External;

public:

  ScriptHelper(v8::Isolate* isolate)
  {
    isolate_ = isolate;
  }

  Handle<Value> GetValue(Handle<Object> object, std::string name)
  {
    return object->Get(String::NewFromUtf8(isolate_, name.c_str()));
  }

  Handle<Object> GetObject(Handle<Value> value)
  {
    if (!value->IsObject()) {
      return Object::New(isolate_);
    }
    return value->ToObject();
  }

  Handle<Object> GetObject(Handle<Object> object, std::string name)
  {
    auto value = GetValue(object, name);
    if (!value->IsObject()) {
      return Object::New(isolate_);
    }
    return value->ToObject();
  }

  template <typename U> 
  U* GetObject(Handle<Object> parent, std::string name, U* defaultValue = NULL)
  {
    auto object = GetObject(parent, name);
    if (object->InternalFieldCount() == 0) {
      return defaultValue;
    }
    auto external = Handle<External>::Cast(object->GetInternalField(0));
    return static_cast<U*>(external->Value());
  }

  float GetFloat(
    Handle<Object> object, std::string name, float defaultValue = 0)
  {
    auto value = GetValue(object, name);
    if (!value->IsNumber()) {
      return defaultValue;
    }
    return value->NumberValue();
  }

  int GetInteger(
    Handle<Object> object, std::string name, int defaultValue = 0)
  {
    auto value = GetValue(object, name);
    if (!value->IsInt32()) {
      return defaultValue;
    }
    return value->Int32Value();
  }

  bool GetBoolean(
    Handle<Object> object, std::string name, bool defaultValue = false)
  {
    auto value = GetValue(object, name);
    if (!value->IsBoolean()) {
      return defaultValue;
    }
    return value->BooleanValue();
  }

  std::string GetString(
    Handle<Object> object, std::string name, std::string defaultValue = "")
  {
    auto value = GetValue(object, name);
    if (!value->IsString()) {
      return defaultValue;
    }
    return std::string(*String::Utf8Value(value));
  }

  std::string GetString(Handle<Value> value, std::string defaultValue = "")
  {
    if (!value->IsString()) {
      return defaultValue;
    }
    return std::string(*String::Utf8Value(value));
  }

  Vector2 GetVector2(
    Handle<Object> object, std::string name, Vector2 defaultValue = { 0, 0 })
  {
    auto vector = GetObject(object, name);
    return Vector2 {
      GetFloat(vector, "x", defaultValue.x),
      GetFloat(vector, "y", defaultValue.y),
    };
  }

  Rectangle GetRectangle(Handle<Object> object,
    std::string name, Rectangle defaultValue = { 0, 0, 0, 0})
  {
    auto rectangle = GetObject(object, name);
    return Rectangle {
      GetFloat(rectangle, "x", defaultValue.x),
      GetFloat(rectangle, "y", defaultValue.y),
      GetFloat(rectangle, "width", defaultValue.width),
      GetFloat(rectangle, "height", defaultValue.height),
    };
  }

  Color GetColor(Handle<Object> object, 
    std::string name, Color defaultValue = { 1.f, 1.f, 1.f, 1.f })
  {
    auto color = GetObject(object, name);
    return Color {
      GetFloat(color, "r", defaultValue.r),
      GetFloat(color, "g", defaultValue.g),
      GetFloat(color, "b", defaultValue.b),
      GetFloat(color, "a", defaultValue.a),
    };
  }

private:

  v8::Isolate* isolate_;

};

#endif