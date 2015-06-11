#include <system/file.h>
#include "graphics/shaderprogram.h"
#include "graphics/window.h"
#include "script/scripthelper.h"
#include "script/scriptengine.h"
#include "GraphicsDevice.h"

using namespace v8;

namespace {

    struct VertexAttribute {
      std::string name;
      int size;
      int offset;
    };

}

ShaderProgram::ShaderProgram(Isolate* isolate, GraphicsDevice* graphicsDevice) :
        ObjectScript(isolate), graphicsDevice_(graphicsDevice) {
    Window::EnsureCurrentContext();
    glShaderProgram_ = glCreateProgram();
    //parameters = new ShaderParameterCollection(isolate, this);
}

ShaderProgram::~ShaderProgram()
{
    //delete parameters;
  glDeleteProgram(glShaderProgram_);
}

void ShaderProgram::AttachShader(ShaderType shaderType, std::string source)
{
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

void ShaderProgram::SetVertexAttribute(
  std::string name, GLint size, GLsizei stride, GLvoid* offset)
{
  auto attribute = glGetAttribLocation(glShaderProgram_, name.c_str());
  glEnableVertexAttribArray(attribute);
  glVertexAttribPointer(attribute, size, GL_FLOAT, GL_FALSE, stride, offset);
}

int ShaderProgram::GetUniformLocation(std::string name) {
    auto iterator = uniforms_.find(name);
    if (iterator == uniforms_.end()) {
        uniforms_[name] = glGetUniformLocation(
                gl_shaderprogram(), name.c_str());
    }
    return static_cast<int>(uniforms_[name]);
}

void ShaderProgram::SetUniformFloat(std::string name, float value) {
    auto oldShaderProgram = graphicsDevice_->GetShaderProgram();
    graphicsDevice_->SetShaderProgram(this);
    glUniform1f(GetUniformLocation(name), value);
    graphicsDevice_->SetShaderProgram(oldShaderProgram);
}

void ShaderProgram::SetUniformInteger(std::string name, int value) {
    auto oldShaderProgram = graphicsDevice_->GetShaderProgram();
    graphicsDevice_->SetShaderProgram(this);
    glUniform1i(GetUniformLocation(name), value);
    graphicsDevice_->SetShaderProgram(oldShaderProgram);
}

void ShaderProgram::SetUniformMatrix4(std::string name,
                                                  float *value) {
    auto oldShaderProgram = graphicsDevice_->GetShaderProgram();
    graphicsDevice_->SetShaderProgram(this);
    glUniformMatrix4fv(GetUniformLocation(name), 1, GL_FALSE, value);
    graphicsDevice_->SetShaderProgram(oldShaderProgram);
}

void ShaderProgram::SetUniformVector2(std::string name,
                                                  float *value) {
    auto oldShaderProgram = graphicsDevice_->GetShaderProgram();
    graphicsDevice_->SetShaderProgram(this);
    glUniform2fv(GetUniformLocation(name), 1, value);
    graphicsDevice_->SetShaderProgram(oldShaderProgram);
}

void ShaderProgram::SetUniformVector3(std::string name,
                                                  float *value) {
    auto oldShaderProgram = graphicsDevice_->GetShaderProgram();
    graphicsDevice_->SetShaderProgram(this);
    glUniform3fv(GetUniformLocation(name), 1, value);
    graphicsDevice_->SetShaderProgram(oldShaderProgram);
}

void ShaderProgram::SetUniformVector4(std::string name,
                                                  float *value) {
    auto oldShaderProgram = graphicsDevice_->GetShaderProgram();
    graphicsDevice_->SetShaderProgram(this);
    glUniform4fv(GetUniformLocation(name), 1, value);
    graphicsDevice_->SetShaderProgram(oldShaderProgram);
}

void ShaderProgram::Initialize() {
    ObjectScript::Initialize();
    SetFunction("apply", Apply);
    SetNamedPropertyHandler(NULL, SetValue);
}

void ShaderProgram::New(const FunctionCallbackInfo<Value>& args)
{
    HandleScope scope(args.GetIsolate());
    ScriptHelper helper(args.GetIsolate());

    auto graphicsDevice = helper.GetObject<GraphicsDevice>(args[0]);

    auto arg = args[1]->ToObject();
    auto vertex = helper.GetString(arg, "vertexShaderFilename");
    auto geometry = helper.GetString(arg, "geometryShaderFilename");
    auto fragment = helper.GetString(arg, "fragmentShaderFilename");

    try {
        auto shaderProgram = new ShaderProgram(args.GetIsolate(),
                                               graphicsDevice);

        auto executionPath = ScriptEngine::GetCurrent().GetExecutionPath();

        shaderProgram->AttachShader(
                ShaderType::Vertex, File::ReadText(executionPath + vertex));
        shaderProgram->AttachShader(
                ShaderType::Fragment, File::ReadText(executionPath + fragment));

        if (geometry != "")
            shaderProgram->AttachShader(
                    ShaderType::Geometry, File::ReadText(executionPath + geometry));

        shaderProgram->Link();

        auto object = shaderProgram->getObject();

        //shaderProgram->parameters->InstallAsObject("parameters", object);

        args.GetReturnValue().Set(object);
    }
    catch (std::exception& ex) {
        ScriptEngine::GetCurrent().ThrowTypeError(ex.what());
    }
}

void ShaderProgram::Apply(const v8::FunctionCallbackInfo<v8::Value> &args) {
    HandleScope scope(args.GetIsolate());
    ScriptHelper helper(args.GetIsolate());
    auto self = ShaderProgram::GetSelf(args.Holder());
    self->Use();
}

void ShaderProgram::SetValue(Local<String> name, Local<Value> value,
                                         const PropertyCallbackInfo<v8::Value> &info) {
    HandleScope scope(info.GetIsolate());
    ScriptHelper helper(info.GetIsolate());
    auto str = *v8::String::Utf8Value(name);
    auto self = ShaderProgram::GetSelf(info.Holder());
    if (value->IsFloat32Array()) {
        Handle<Float32Array> array = Handle<Float32Array>::Cast(value);
        GLfloat data[array->Length()];
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
    }
    else if (value->IsInt32()) {
        self->SetUniformInteger(str, value->Int32Value());
    }
    else if (value->IsNumber()) {
        self->SetUniformFloat(str, static_cast<float>(value->NumberValue()));
    }
}
