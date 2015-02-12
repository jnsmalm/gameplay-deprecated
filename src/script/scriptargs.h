#ifndef SCRIPTARGS_H
#define SCRIPTARGS_H

#include "script/scriptobject.h"
#include "graphics/types.h"

#include "v8.h"
#include <string>

class ScriptArgs {

public:

  // Gets the argument as an object at the specified index.
  template <typename T> 
  static T* GetObject(
    const v8::FunctionCallbackInfo<v8::Value>& args, int index)
  {
    v8::HandleScope scope(args.GetIsolate());
    v8::Handle<v8::Object> arg = v8::Handle<v8::Object>::Cast(args[index]);
    v8::Handle<v8::External> ext = v8::Handle<v8::External>::Cast(
     arg->GetInternalField(0));
    return static_cast<T*>(ext->Value());
  }

  // Gets the argument as self (the caller).
  template <typename T> 
  static T* GetSelf(const v8::FunctionCallbackInfo<v8::Value>& args)
  {
    return ScriptObject::Unwrap<T>(args.Holder());
  }

  // Gets the argument as self (the caller).
  template <typename T> 
  static T* GetSelf(const v8::PropertyCallbackInfo<v8::Value>& args)
  {
    return ScriptObject::Unwrap<T>(args.Holder());
  }

  // Gets the argument as a number at the specified index.
  static const float GetNumber(
   const v8::FunctionCallbackInfo<v8::Value>& args, int index)
  {
    v8::HandleScope scope(args.GetIsolate());
    auto number = v8::Handle<v8::Number>::Cast(args[index]);
      return number->Value();
  }

  // Gets the argument as a boolean at the specified index.
  static const bool GetBoolean(
   const v8::FunctionCallbackInfo<v8::Value>& args, int index)
  {
    v8::HandleScope scope(args.GetIsolate());
    auto boolean = v8::Handle<v8::BooleanObject>::Cast(args[index]);
    return boolean->BooleanValue();
  }

  // Gets the argument as a string at the specified index
  static const std::string GetString(
    const v8::FunctionCallbackInfo<v8::Value>& args, int index)
  {
    v8::HandleScope scope(args.GetIsolate());
    return std::string(*v8::String::Utf8Value(args[index]));
  }

  // Sets a number as the result.
  static void SetNumberResult(
    const v8::PropertyCallbackInfo<v8::Value>& args, double value)
  {
    v8::HandleScope scope(args.GetIsolate());
    auto number = v8::Number::New(args.GetIsolate(), value);
    args.GetReturnValue().Set(number);
  }

  // Sets a number as the result.
  static void SetNumberResult(
    const v8::FunctionCallbackInfo<v8::Value>& args, double value)
  {
    v8::HandleScope scope(args.GetIsolate());
    auto number = v8::Number::New(args.GetIsolate(), value);
    args.GetReturnValue().Set(number);
  }

  // Sets a boolean as the result.
  static void SetBooleanResult(
    const v8::FunctionCallbackInfo<v8::Value>& args, bool value)
  {
    v8::HandleScope scope(args.GetIsolate());
    auto boolean = v8::Boolean::New(args.GetIsolate(), value);
    args.GetReturnValue().Set(boolean);
  }

  // Sets an object as the result.
  static void SetObjectResult(const v8::FunctionCallbackInfo<v8::Value>& args,
    v8::Handle<v8::Object> value)
  {
    args.GetReturnValue().Set(value);
  }

};

#endif