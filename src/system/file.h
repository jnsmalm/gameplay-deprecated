#ifndef FILE_H
#define FILE_H

#include <string>

class File {

public:

  // Read all text in the specified file.
  static std::string ReadAllText(std::string filename);

};

#endif