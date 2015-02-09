#ifndef SCRIPTVALUE_H
#define SCRIPTVALUE_H

#include <string>
#include "v8.h"

class ScriptValue {

  public:

    // Converts the specified value to a string.
    static std::string ToString(
      v8::Handle<v8::Value> value, std::string defaultValue = "");
    // Converts the specified value to a number.
    static double ToNumber(
      v8::Handle<v8::Value> value, double defaultValue = 0);
    // Converts the specified value to a bool.
    static bool ToBoolean(
      v8::Handle<v8::Value> value, bool defaultValue = false);

};

#endif