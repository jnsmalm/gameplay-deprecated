#ifndef FILE_H
#define FILE_H

#include "v8.h"
#include <string>

class File {

  // Class that is only available to file.
  class ScriptFile;

public:

  // Read text in the specified file.
  static std::string ReadText(std::string filename);

  static void InstallScript(
    v8::Isolate* isolate, v8::Handle<v8::ObjectTemplate> global);

};

#endif