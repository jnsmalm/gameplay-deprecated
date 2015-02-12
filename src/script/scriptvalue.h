#ifndef SCRIPTVALUE_H
#define SCRIPTVALUE_H

#include <string>
#include "v8.h"
#include <functional>

class ScriptConvert {

public:

  // Wraps tbe specified pointer to a v8 script object.
  template <typename T> 
  static v8::Handle<v8::Object> Wrap(v8::Isolate* isolate, 
    T* ptr, std::function<void(const v8::Local<v8::ObjectTemplate>)> setup)
  {
    auto objectTemplate = v8::ObjectTemplate::New(isolate);
    objectTemplate->SetInternalFieldCount(1);
    if (setup != NULL) {
      setup(objectTemplate);
    } 
    auto object = objectTemplate->NewInstance();
    object->SetInternalField(0, v8::External::New(isolate, ptr));
    return object;
  }

  // Unwraps the specified v8 object to a pointer.
  template <typename T> 
  static T* To(v8::Handle<v8::Object> object, T* defaultValue = NULL)
  {
    if (object->InternalFieldCount() == 0) {
      return defaultValue;
    }
    auto ext = v8::Handle<v8::External>::Cast(object->GetInternalField(0));
    return static_cast<T*>(ext->Value());
  }

};

class ScriptValue {

  public:

    // Converts the specified value to a number.
    static double ToNumber(
      v8::Handle<v8::Value> value, double defaultValue = 0);
    // Converts the specified value to a bool.
    static bool ToBoolean(
      v8::Handle<v8::Value> value, bool defaultValue = false);
    // Converts the specified value to a string.
    static std::string ToString(
      v8::Handle<v8::Value> value, std::string defaultValue = "");
    // Convert the specified float to a value.
    static v8::Handle<v8::Value> ToValue(v8::Isolate* isolate, float value);

    // Unwraps the specified v8 object to a pointer.
    template <typename T> 
    static T* GetObject(v8::Handle<v8::Object> object, T* defaultValue = NULL)
    {
      if (object->InternalFieldCount() == 0) {
        return defaultValue;
      }
      auto ext = v8::Handle<v8::External>::Cast(object->GetInternalField(0));
      return static_cast<T*>(ext->Value());
    }

};

#endif