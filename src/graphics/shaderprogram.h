#ifndef SHADERPROGRAM_H
#define SHADERPROGRAM_H

#include "shader.h"
#include "v8.h"
#include <gl/glew.h>
#include <map>
#include <script/ObjectScript.h>

class ShaderParameterCollection;
class GraphicsDevice;

class ShaderProgram : ObjectScript<ShaderProgram> {

  friend class GraphicsDevice;

public:
  ShaderProgram(v8::Isolate* isolate, GraphicsDevice* graphicsDevice);
  ~ShaderProgram();

  // Attaches a shader of the specified type and source.
  void AttachShader(ShaderType shaderType, std::string source);
  // Link the attached shaders.
  void Link();
  // Set the shader program as the current one.
  void Use();
  // Set the vertex attribute with the specified name.
  void SetVertexAttribute(
    std::string name, GLint size, GLsizei stride, GLvoid* offset);

    void SetUniformFloat(std::string name, float value);
    void SetUniformInteger(std::string name, int value);
    void SetUniformMatrix4(std::string name, GLfloat *value);
    void SetUniformVector2(std::string name, GLfloat *value);
    void SetUniformVector3(std::string name, GLfloat *value);
    void SetUniformVector4(std::string name, GLfloat *value);

  static void New(const v8::FunctionCallbackInfo<v8::Value>& args);

    GLuint gl_shaderprogram() {
        return glShaderProgram_;
    }

private:

    virtual void Initialize() override;
    int GetUniformLocation(std::string name);
    static void Apply(const v8::FunctionCallbackInfo<v8::Value>& args);
    static void SetValue(v8::Local<v8::String> name, v8::Local<v8::Value> value,
                         const v8::PropertyCallbackInfo<v8::Value> &info);

  GLuint glShaderProgram_;
  //ShaderParameterCollection* parameters;
    GraphicsDevice* graphicsDevice_;
    std::map<std::string, GLint> uniforms_;

};

#endif