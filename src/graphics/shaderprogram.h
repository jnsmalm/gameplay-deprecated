#ifndef SHADERPROGRAM_H
#define SHADERPROGRAM_H

#include "shader.h"

#include "v8.h"
#include <gl/glew.h>
#include <map>

enum class UniformDataType {

  Matrix4,
  Vector2,
  Vector3,
  Vector4,
  Float,

};

class ShaderProgram {

  friend class GraphicsDevice;

  // Class that is only available to shader program.
  class ScriptShaderProgram;

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
  void SetUniform(
          std::string name, UniformDataType dataType, GLfloat *value);
  // Set the vertex attribute with the specified name.
  void SetVertexAttribute(
    std::string name, GLint size, GLsizei stride, GLvoid* offset);

  // Initializes the script object.
  static void InstallScript(
    v8::Isolate* isolate, v8::Handle<v8::ObjectTemplate> global);

private:

  GLuint glShaderProgram_;
  std::map<std::string,GLuint> uniformLocations_;

};

#endif