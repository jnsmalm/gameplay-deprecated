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

#include "graphics/shader.h"
#include "graphics/window.h"
#include "script/scriptengine.h"

Shader::Shader(ShaderType type, std::string source) {
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

    auto src = source.c_str();
    glShaderSource(glShader_, 1, &src, NULL);
    glCompileShader(glShader_);

    GLint status;
    glGetShaderiv(glShader_, GL_COMPILE_STATUS, &status);
    if (!status) {
        char message[512];
        glGetShaderInfoLog(glShader_, 512, NULL, message);
        throw std::runtime_error(
                "Failed to compile shader: " + std::string(message));
    }
}

Shader::~Shader() {
  glDeleteShader(glShader_);
}