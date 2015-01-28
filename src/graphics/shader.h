#ifndef SHADER_H
#define SHADER_H

#include <gl/glew.h>
#include <string>

enum ShaderType {

  Vertex,
  Geometry,
  Fragment,
  
};

class Shader {

  friend class ShaderProgram;

public:

  Shader(ShaderType type, std::string source);
  ~Shader();

private:

  GLuint glShader_;

};

#endif