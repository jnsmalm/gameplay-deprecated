#include <system/file.h>
#include "graphics/shaderprogram.h"
#include "graphics/window.h"
#include "script/scriptobject.h"
#include "script/scripthelper.h"
#include "script/scriptengine.h"

using namespace v8;

namespace {

    struct VertexAttribute {
      std::string name;
      int size;
      int offset;
    };

}

// Helps with setting up the script object.
class ShaderProgram::ScriptShaderProgram : public ScriptObject<ShaderProgram> {

public:

  void Initialize()
  {
    ScriptObject::Initialize();
    AddFunction("use", Use);
    AddFunction("setVertexAttributes", SetVertexAttributes);
    AddFunction("setUniformValue", SetUniform);
  }

  static void New(const FunctionCallbackInfo<Value>& args)
  {
    HandleScope scope(args.GetIsolate());
    ScriptHelper helper(args.GetIsolate());

    auto arg = args[0]->ToObject();
    auto vertex = helper.GetString(arg, "vertexShaderFilename");
    auto geometry = helper.GetString(arg, "geometryShaderFilename");
    auto fragment = helper.GetString(arg, "fragmentShaderFilename");

    try {
      auto scriptObject = new ScriptShaderProgram(args.GetIsolate());
      auto shaderProgram = new ShaderProgram();

      auto executionPath = ScriptEngine::GetCurrent().GetExecutionPath();

      shaderProgram->AttachShader(
              ShaderType::Vertex, File::ReadText(executionPath + vertex));
      shaderProgram->AttachShader(
              ShaderType::Fragment, File::ReadText(executionPath + fragment));

      if (geometry != "")
        shaderProgram->AttachShader(
          ShaderType::Geometry, File::ReadText(executionPath + geometry));

      shaderProgram->Link();

      auto object = scriptObject->Wrap(shaderProgram);
      args.GetReturnValue().Set(object);
    }
    catch (std::exception& ex) {
      ScriptEngine::GetCurrent().ThrowTypeError(ex.what());
    }
  }

  static void SetVertexAttributes(const FunctionCallbackInfo<Value>& args)
  {
    HandleScope scope(args.GetIsolate());
    ScriptHelper helper(args.GetIsolate());



    Handle<Array> array = Handle<Array>::Cast(args[0]);

    std::vector<VertexAttribute> attributes;

    int offset = 0;

    float data[array->Length()];
    for (int i = 0; i < array->Length(); i++) {
      auto obj = array->Get(i)->ToObject();

      VertexAttribute attr;
      attr.name = helper.GetString(obj, "name");
      attr.offset = offset;

      auto type = helper.GetString(obj, "type");

      if (type == "vec2") {
        attr.size = 2;
        offset += 8;
      }
      else if (type == "vec3") {
        attr.size = 3;
        offset += 12;
      }
      else if (type == "vec4") {
        attr.size = 4;
        offset += 16;
      }

      attributes.push_back(attr);
    }

    auto self = Unwrap<ShaderProgram>(args.Holder());

    for (int i = 0; i < attributes.size(); ++i) {
      auto attr = attributes[i];
      self->SetVertexAttribute(
              attr.name, attr.size, offset, (GLvoid *) attr.offset);
    }
  }

  static void Use(const FunctionCallbackInfo<Value>& args)
  {
    HandleScope scope(args.GetIsolate());
    ScriptHelper helper(args.GetIsolate());
    auto self = Unwrap<ShaderProgram>(args.Holder());
    self->Use();
  }

  static void SetUniform(const FunctionCallbackInfo<Value>& args)
  {
    HandleScope scope(args.GetIsolate());
    ScriptHelper helper(args.GetIsolate());

    auto self = Unwrap<ShaderProgram>(args.Holder());
    auto arg = args[0]->ToObject();
    auto name = helper.GetString(arg, "name");
    auto type = helper.GetString(arg, "type");

    UniformDataType uniformDataType;

    if (type == "vec2")
      uniformDataType = UniformDataType::Vector2;
    else if (type == "vec3")
      uniformDataType = UniformDataType::Vector3;
    else if (type == "vec4")
      uniformDataType = UniformDataType::Vector4;
    else if (type == "mat4")
      uniformDataType = UniformDataType::Matrix4;
    else if (type == "float")
      uniformDataType = UniformDataType::Float;
    else
      throw std::runtime_error("Unknown uniform type");

    Handle<Array> array = Handle<Array>::Cast(helper.GetValue(arg, "value"));
    float data[array->Length()];
    for (int i = 0; i < array->Length(); i++) {
      data[i] = (float) array->Get(i)->NumberValue();
    }

    self->SetUniform(name, uniformDataType, data);
  }

private:

  // Inherit constructors.
  using ScriptObject::ScriptObject;

};

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

void ShaderProgram::SetUniform(
        std::string name, UniformDataType dataType, GLfloat *value)
{
  // Check if the location already exists within map.
  auto iterator = uniformLocations_.find(name);
  if(iterator == uniformLocations_.end()) {
    // Does not exist yet, get uniform location.
    uniformLocations_[name] = 
      glGetUniformLocation(glShaderProgram_, name.c_str());
  }
  // Use the method corresponding to the data type.
  switch (dataType) {
    case UniformDataType::Matrix4:
      glUniformMatrix4fv(uniformLocations_[name], 1, GL_FALSE, value);
      break;
    case UniformDataType::Vector2:
      glUniform2fv(uniformLocations_[name], 1, value);
      break;
    case UniformDataType::Vector3:
      glUniform3fv(uniformLocations_[name], 1, value);
      break;
    case UniformDataType::Vector4:
      glUniform4fv(uniformLocations_[name], 1, value);
      break;
    case UniformDataType::Float:
      glUniform1fv(uniformLocations_[name], 1, value);
      break;
  }
}

void ShaderProgram::SetVertexAttribute(
  std::string name, GLint size, GLsizei stride, GLvoid* offset)
{
  GLint attribute = glGetAttribLocation(glShaderProgram_, name.c_str());
  glEnableVertexAttribArray(attribute);
  glVertexAttribPointer(attribute, size, GL_FLOAT, GL_FALSE, stride, offset);
}

void ShaderProgram::InstallScript(
  Isolate *isolate, Handle<ObjectTemplate> global)
{
  ScriptShaderProgram::InstallAsConstructor<ScriptShaderProgram>(
          isolate, "ShaderProgram", global);
}
