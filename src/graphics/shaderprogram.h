#ifndef SHADERPROGRAM_H
#define SHADERPROGRAM_H

#include "v8.h"
#include <gl/glew.h>
#include <map>
#include "shader.h"

enum UniformDataType {

  Matrix4,

};

class ShaderProgram {

public:

  ShaderProgram();
  ~ShaderProgram();

  // Attaches a shader of the specified type and source.
  void AttachShader(ShaderType shaderType, std::string source);
  // Link the attached shaders.
  void Link();
  // Set the shader program as the current one.
  void Use();
  // Set the value of the uniform variable.
  void SetUniformValue(
   std::string name, UniformDataType dataType, GLfloat* value);
  // Set the vertex attribute with the specified name.
  void SetVertexAttribute(
    std::string name, GLint size, GLsizei stride, GLvoid* offset);

private:

  GLuint glShaderProgram_;
  std::map<std::string,GLuint> uniformLocations_;

};

#endif