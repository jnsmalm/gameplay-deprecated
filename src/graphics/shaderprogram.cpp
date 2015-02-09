#include "graphics/shaderprogram.h"
#include "graphics/shader.h"
#include "graphics/window.h"

ShaderProgram::ShaderProgram()
{
  Window::EnsureCurrentContext();
  glShaderProgram_ = glCreateProgram();
}

ShaderProgram::~ShaderProgram()
{
  glDeleteProgram(glShaderProgram_);
}

void ShaderProgram::AttachShader(ShaderType shaderType, std::string source)
{
  // Create and attach the shader.
  Shader shader(shaderType, source);
  glAttachShader(glShaderProgram_, shader.glShader_);
}

void ShaderProgram::Link()
{
  glLinkProgram(glShaderProgram_);
}

void ShaderProgram::Use()
{
  glUseProgram(glShaderProgram_);
}

void ShaderProgram::SetUniformValue(
  std::string name, UniformDataType dataType, GLfloat* value)
{
  // Check if the location already exists within map
  auto iterator = uniformLocations_.find(name);
  if(iterator == uniformLocations_.end()) {
    // Does not exist yet, get uniform location
    uniformLocations_[name] = 
      glGetUniformLocation(glShaderProgram_, name.c_str());
  }
  // Use the method corresponding to the data type
  switch (dataType) {
    case UniformDataType::Matrix4:
      glUniformMatrix4fv(uniformLocations_[name], 1, GL_FALSE, value);
      break;
    case UniformDataType::Float:
      glUniform1fv(uniformLocations_[name], 1, value);
      break;
    /*case UniformDataType::Vector2:
      glUniform2fv(uniformLocations_[name], 1, value);
      break;*/
  }
}

void ShaderProgram::SetVertexAttribute(
  std::string name, GLint size, GLsizei stride, GLvoid* offset)
{
  GLint attribute = glGetAttribLocation(glShaderProgram_, name.c_str());
  glEnableVertexAttribArray(attribute);
  glVertexAttribPointer(attribute, size, GL_FLOAT, GL_FALSE, stride, offset);
}