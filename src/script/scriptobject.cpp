#include "script/scriptobject.h"
#include "script/scriptvalue.h"

using namespace v8;

ScriptObject::ScriptObject(v8::Isolate* isolate, v8::Handle<v8::Object> object)
{
  isolate_ = isolate;
  object_ = object;
}

Vector2 ScriptObject::GetVector2(std::string name, Vector2 defaultValue)
{
  auto vector = GetObject(object_, name);
  return Vector2 {
    GetNumber(vector, "x", defaultValue.x),
    GetNumber(vector, "y", defaultValue.y),
  };
}

Rectangle ScriptObject::GetRectangle(std::string name, Rectangle defaultValue)
{
  auto rect = GetObject(object_, name);
  return Rectangle {
    GetNumber(rect, "x", defaultValue.x),
    GetNumber(rect, "y", defaultValue.y),
    GetNumber(rect, "width", defaultValue.width),
    GetNumber(rect, "height", defaultValue.height),
  };
}

Color ScriptObject::GetColor(std::string name, Color defaultValue)
{
  auto clr = GetObject(object_, name);
  return Color {
    GetNumber(clr, "r", defaultValue.r),
    GetNumber(clr, "g", defaultValue.g),
    GetNumber(clr, "b", defaultValue.b),
    GetNumber(clr, "a", defaultValue.a),
  };
}

float ScriptObject::GetNumber(std::string name)
{
  return GetNumber(object_, name);
}

float ScriptObject::GetNumber(
  Handle<Object> object, std::string name, float defaultValue)
{
  auto value = GetValue(object, name);
  if (value->IsNull() || value->IsUndefined()) {
    return defaultValue;
  }
  return ScriptValue::ToNumber(value);
}

Handle<Object> ScriptObject::GetObject(Handle<Object> object, std::string name)
{
  auto value = GetValue(object, name);
  if (!value->IsObject()) {
    return Object::New(isolate_);
  }
  return value->ToObject();
}

Handle<Value> ScriptObject::GetValue(Handle<Object> object, std::string name)
{
  return object->Get(String::NewFromUtf8(isolate_, name.c_str()));
}

void ScriptObject::BindFunction(Handle<ObjectTemplate> tmpl, const char* name, 
  FunctionCallback function)
{
  auto isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
  tmpl->Set(String::NewFromUtf8(isolate, name), 
    FunctionTemplate::New(isolate, function));
}

void ScriptObject::BindProperty(Handle<ObjectTemplate> tmpl, const char* name, 
  AccessorGetterCallback getter)
{
  auto isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
  tmpl->SetAccessor(String::NewFromUtf8(isolate, name), getter);
}