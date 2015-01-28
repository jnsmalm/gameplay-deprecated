#include "system/file.h"
#include <fstream>

std::string File::ReadAllText(std::string filename)
{
  // Read everything in the specified file
  std::ifstream in { filename };
  std::string contents((std::istreambuf_iterator<char>(in)),
    std::istreambuf_iterator<char>());
  return contents;
}