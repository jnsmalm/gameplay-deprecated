#include "script/scriptvalue.h"

using namespace v8;

std::string ScriptValue::ToString(
  v8::Handle<v8::Value> value, std::string defaultValue)
{
  if (!value->IsString()) {
    return defaultValue;
  }
  return std::string(*String::Utf8Value(value));
}

double ScriptValue::ToNumber(v8::Handle<v8::Value> value, double defaultValue)
{
  if (!value->IsNumber()) {
    return defaultValue;
  }
  return value->NumberValue();
}

bool ScriptValue::ToBoolean(v8::Handle<v8::Value> value, bool defaultValue)
{
  if (!value->IsBoolean()) {
    return defaultValue;
  }
  return value->BooleanValue();
}