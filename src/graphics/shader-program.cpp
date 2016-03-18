/*The MIT License (MIT)

Copyright (c) 2015 Jens Malmborg

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

#include <utils/file-reader.h>
#include "shader-program.h"
#include "graphics/window.h"
#include "script/scripthelper.h"
#include <script/script-engine.h>

using namespace v8;

ShaderProgram::ShaderProgram(Isolate* isolate, GraphicsDevice* graphicsDevice,
                             std::string path) :
        ScriptObjectWrap(isolate), graphicsDevice_(graphicsDevice) {

    Window::EnsureCurrentContext();
    glProgram_ = glCreateProgram();

    if (path.compare(path.length() - 1, 1, "/") != 0) {
        path += "/";
    }
    auto geometry = path + "geometry.glsl";
    auto vertex = path + "vertex.glsl";
    auto fragment = path + "fragment.glsl";

    if (FileReader::Exists(geometry)) {
        AttachShader(ShaderType::Geometry, FileReader::ReadAsText(geometry));
    }
    AttachShader(ShaderType::Vertex, FileReader::ReadAsText(vertex));
    AttachShader(ShaderType::Fragment, FileReader::ReadAsText(fragment));
    glLinkProgram(glProgram_);
}

ShaderProgram::~ShaderProgram() {
    glDeleteProgram(glProgram_);
}

void ShaderProgram::AttachShader(ShaderType shaderType, std::string source) {
    Shader shader(shaderType, source);
    glAttachShader(glProgram_, shader.glShader());
}

int ShaderProgram::GetUniformLocation(std::string name) {
    auto iterator = uniforms_.find(name);
    if (iterator == uniforms_.end()) {
        auto location = glGetUniformLocation(glProgram_, name.c_str());
        if (location == -1) {
            throw std::runtime_error(
                    "Uniform value '" + name + "' does not exist");
        }
        uniforms_[name] = glGetUniformLocation(glProgram_, name.c_str());
    }
    return static_cast<int>(uniforms_[name]);
}

void ShaderProgram::SetUniformFloat(std::string name, float value) {
    auto oldShaderProgram = graphicsDevice_->shaderProgram();
    graphicsDevice_->SetShaderProgram(this);
    glUniform1f(GetUniformLocation(name), value);
    graphicsDevice_->SetShaderProgram(oldShaderProgram);
}

bool ShaderProgram::SetUniformInteger(std::string name, int value) {
    auto oldShaderProgram = graphicsDevice_->shaderProgram();
    graphicsDevice_->SetShaderProgram(this);
    glUniform1i(GetUniformLocation(name), value);
    auto error = glGetError();
    graphicsDevice_->SetShaderProgram(oldShaderProgram);
    return error == GL_NO_ERROR;
}

void ShaderProgram::SetUniformMatrix4(std::string name, float *value) {
    auto oldShaderProgram = graphicsDevice_->shaderProgram();
    graphicsDevice_->SetShaderProgram(this);
    glUniformMatrix4fv(GetUniformLocation(name), 1, GL_FALSE, value);
    graphicsDevice_->SetShaderProgram(oldShaderProgram);
}

void ShaderProgram::SetUniformVector2(std::string name, float *value) {
    auto oldShaderProgram = graphicsDevice_->shaderProgram();
    graphicsDevice_->SetShaderProgram(this);
    glUniform2fv(GetUniformLocation(name), 1, value);
    graphicsDevice_->SetShaderProgram(oldShaderProgram);
}

void ShaderProgram::SetUniformVector3(std::string name, float *value) {
    auto oldShaderProgram = graphicsDevice_->shaderProgram();
    graphicsDevice_->SetShaderProgram(this);
    glUniform3fv(GetUniformLocation(name), 1, value);
    graphicsDevice_->SetShaderProgram(oldShaderProgram);
}

void ShaderProgram::SetUniformVector4(std::string name, float *value) {
    auto oldShaderProgram = graphicsDevice_->shaderProgram();
    graphicsDevice_->SetShaderProgram(this);
    glUniform4fv(GetUniformLocation(name), 1, value);
    graphicsDevice_->SetShaderProgram(oldShaderProgram);
}

void ShaderProgram::Initialize() {
    ScriptObjectWrap::Initialize();
    SetNamedPropertyHandler(NULL, SetUniformValue);
}

void ShaderProgram::New(const FunctionCallbackInfo<Value>& args) {
    HandleScope scope(args.GetIsolate());
    ScriptHelper helper(args.GetIsolate());

    auto graphicsDevice = helper.GetObject<GraphicsDevice>(args[0]);
    auto path = ScriptEngine::current().resolvePath(helper.GetString(args[1]));
    try {
        auto shaderProgram = new ShaderProgram(
                args.GetIsolate(), graphicsDevice, path);
        args.GetReturnValue().Set(shaderProgram->v8Object());
    }
    catch (std::exception& ex) {
        ScriptEngine::current().ThrowTypeError(ex.what());
    }
}

void ShaderProgram::SetUniformValue(
        Local<String> name, Local<Value> value,
        const PropertyCallbackInfo<v8::Value> &info) {

    HandleScope scope(info.GetIsolate());
    ScriptHelper helper(info.GetIsolate());

    auto str = std::string(*v8::String::Utf8Value(name));
    auto self = GetInternalObject(info.Holder());

    try {
        if (value->IsFloat32Array()) {
            Handle<Float32Array> array = Handle<Float32Array>::Cast(value);
            GLfloat *data = new GLfloat[array->Length()];
            for (int i = 0; i < array->Length(); i++) {
                data[i] = (GLfloat) array->Get(i)->NumberValue();
            }
            switch (array->Length()) {
                case 2: {
                    self->SetUniformVector2(str, data);
                    break;
                }
                case 3: {
                    self->SetUniformVector3(str, data);
                    break;
                }
                case 4: {
                    self->SetUniformVector4(str, data);
                    break;
                }
                case 16: {
                    self->SetUniformMatrix4(str, data);
                    break;
                }
            }
            delete[] data;
        }
        else if (value->IsInt32()) {
            // JavaScript can't distinguish between an integer (e.g. 32) and a
            // float (e.g. 32.0). So if it looks like an integer we try to set
            // the uniform as an integer, if it fails we instead set it as a
            // float.
            if (!self->SetUniformInteger(str, value->Int32Value())) {
                self->SetUniformFloat(
                        str, static_cast<float>(value->NumberValue()));
            }
        }
        else if (value->IsNumber()) {
            self->SetUniformFloat(str, static_cast<float>(value->NumberValue()));
        }
    }
    catch (std::exception& error) {
        ScriptEngine::current().ThrowTypeError(error.what());
    }



}
