/*The MIT License (MIT)

JSPlay Copyright (c) 2015 Jens Malmborg

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.*/

#ifndef JSPLAY_SHADERPROGRAM_H
#define JSPLAY_SHADERPROGRAM_H

#include "shader.h"
#include "v8.h"
#include <gl/glew.h>
#include <map>
#include <script/script-object-wrap.h>

class ShaderParameterCollection;
class GraphicsDevice;

class ShaderProgram : public ScriptObjectWrap<ShaderProgram> {

public:
    ShaderProgram(v8::Isolate* isolate, GraphicsDevice* graphicsDevice,
                  std::string path);
    ~ShaderProgram();

    void SetVertexAttribute(
      std::string name, GLint size, GLsizei stride, GLvoid* offset);

    // TODO: Move uniform setters to UniformCollection
    void SetUniformFloat(std::string name, float value);
    void SetUniformInteger(std::string name, int value);
    void SetUniformMatrix4(std::string name, GLfloat *value);
    void SetUniformVector2(std::string name, GLfloat *value);
    void SetUniformVector3(std::string name, GLfloat *value);
    void SetUniformVector4(std::string name, GLfloat *value);

    static void New(const v8::FunctionCallbackInfo<v8::Value>& args);

    GLuint glProgram() {
      return glProgram_;
    }

private:
    void AttachShader(ShaderType shaderType, std::string source);
    int GetUniformLocation(std::string name);
    virtual void Initialize() override;
    static void SetUniformValue(v8::Local<v8::String> name,
                                v8::Local<v8::Value> value,
                                const v8::PropertyCallbackInfo<v8::Value> &info);

    GraphicsDevice* graphicsDevice_;
    GLuint glProgram_;
    std::map<std::string, GLint> uniforms_;
};

#endif // JSPLAY_SHADERPROGRAM_H