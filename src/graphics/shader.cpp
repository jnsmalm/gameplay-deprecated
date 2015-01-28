#include "graphics/shader.h"
#include "script/scriptengine.h"
#include "graphics/window.h"

namespace {

void CompileShader(GLuint shader, std::string source)
{
  // Set shader source and compile.
  auto src = (const GLchar *) source.c_str();
  glShaderSource(shader, 1, &src, NULL);
  glCompileShader(shader);

  // Get shader compilation status.
  GLint status;
  glGetShaderiv(shader, GL_COMPILE_STATUS, &status);

  if (!status) {
    // Throw exception if something went wrong.
    char message[512];
    glGetShaderInfoLog(shader, 512, NULL, message);
    throw std::runtime_error(
      "Failed to compile shader: " + std::string(message));
  }
}

}

Shader::Shader(ShaderType type, std::string source)
{
  Window::EnsureCurrentContext();

  switch (type) {
    case ShaderType::Geometry:
      glShader_ = glCreateShader(GL_GEOMETRY_SHADER);
      break;
    case ShaderType::Fragment:
      glShader_  = glCreateShader(GL_FRAGMENT_SHADER);
      break;
    default:
      glShader_ = glCreateShader(GL_VERTEX_SHADER);
  }

  CompileShader(glShader_, source);
}

Shader::~Shader()
{
  glDeleteShader(glShader_);
}