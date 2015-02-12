#include "script/scriptvalue.h"

using namespace v8;

double ScriptValue::ToNumber(Handle<Value> value, double defaultValue)
{
  if (!value->IsNumber()) {
    return defaultValue;
  }
  return value->NumberValue();
}

bool ScriptValue::ToBoolean(Handle<Value> value, bool defaultValue)
{
  if (!value->IsBoolean()) {
    return defaultValue;
  }
  return value->BooleanValue();
}

std::string ScriptValue::ToString(Handle<Value> value, std::string defaultValue)
{
  if (!value->IsString()) {
    return defaultValue;
  }
  return std::string(*String::Utf8Value(value));
}