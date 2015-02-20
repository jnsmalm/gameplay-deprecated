#include "graphics/spritebatch.h"
#include "graphics/spriteshaders.h"
#include "script/scriptobject.h"
#include "script/scriptengine.h"

#include "glm/glm.hpp"
#include "glm/gtc/matrix_transform.hpp"
#include "glm/gtc/type_ptr.hpp"

using namespace v8;

namespace {

void SetSpriteVertexAttributes(ShaderProgram* shaderProgram)
{
  // Get pointer offset of 'field' in struct 'type'.
  #define poffsetof(type, field) \
    ((void *) (&((type *) 0)->field))

  shaderProgram->SetVertexAttribute("position", 
    2, sizeof(SpriteVertex), poffsetof(SpriteVertex, position));
  shaderProgram->SetVertexAttribute("origin", 
    2, sizeof(SpriteVertex), poffsetof(SpriteVertex, origin));
  shaderProgram->SetVertexAttribute("color", 
    4, sizeof(SpriteVertex), poffsetof(SpriteVertex, color));
  shaderProgram->SetVertexAttribute("rotation", 
    1, sizeof(SpriteVertex), poffsetof(SpriteVertex, rotation));
  shaderProgram->SetVertexAttribute("scaling", 
    2, sizeof(SpriteVertex), poffsetof(SpriteVertex, scaling));
  shaderProgram->SetVertexAttribute("atlasSize", 
    2, sizeof(SpriteVertex), poffsetof(SpriteVertex, atlasSize));
  shaderProgram->SetVertexAttribute("atlasSource", 
    4, sizeof(SpriteVertex), poffsetof(SpriteVertex, atlasSource));
  shaderProgram->SetVertexAttribute("text", 
    1, sizeof(SpriteVertex), poffsetof(SpriteVertex, text));
}

}

// Helps with setting up the script object.
class SpriteBatch::ScriptSpriteBatch : public ScriptObject<ScriptSpriteBatch> {

public:

  void Setup()
  {
    AddFunction("begin", Begin);
    AddFunction("end", End);
    AddFunction("draw", Draw);
    AddFunction("drawString", DrawString);
  }

  static void New(const FunctionCallbackInfo<Value>& args)
  {
    HandleScope scope(args.GetIsolate());
    try {
      auto window = Unwrap<Window>(args[0]->ToObject());
      auto object = Wrap(new SpriteBatch(window));
      args.GetReturnValue().Set(object);
    }
    catch (std::exception& ex) {
      ScriptEngine::GetCurrent().ThrowTypeError(ex.what());
    }
  }

  static void Begin(const FunctionCallbackInfo<Value>& args)
  {
    HandleScope scope(args.GetIsolate());
    auto self = Unwrap<SpriteBatch>(args.Holder());
    self->Begin();
  }

  static void End(const FunctionCallbackInfo<Value>& args)
  {
    HandleScope scope(args.GetIsolate());
    auto self = Unwrap<SpriteBatch>(args.Holder());
    self->End();
  }

  static void Draw(const FunctionCallbackInfo<Value>& args)
  {
    if (args.Length() == 0) {
      return;
    }

    HandleScope scope(args.GetIsolate());
    auto self = Unwrap<SpriteBatch>(args.Holder());

    // The first and only argument is an object.
    auto arg = args[0]->ToObject();

    // Get arguments from object.
    auto texture = GetObject<Texture>(arg, "texture");
    auto position = GetVector2(arg, "position");
    auto rotation = GetNumber(arg, "rotation");
    auto scaling = GetVector2(arg, "scaling", Vector2 { 1.0f, 1.0f });
    auto color = GetColor(arg, "color");
    auto origin = GetVector2(arg, "origin");
    auto source = Rectangle { 0, 0, 0, 0 };

    if (texture) {
      source = GetRectangle(arg, "source", Rectangle { 
        0, 0, (float)texture->GetWidth(), (float)texture->GetHeight() 
      });
    }

    try {
      self->Draw(texture, position, rotation, origin, scaling, color, source);
    }
    catch (std::exception& ex) {
      ScriptEngine::GetCurrent().ThrowTypeError(ex.what());
    }
  }

  static void DrawString(const FunctionCallbackInfo<Value>& args)
  {
    if (args.Length() == 0) {
      return;
    }

    HandleScope scope(args.GetIsolate());
    auto self = Unwrap<SpriteBatch>(args.Holder());

    // The first and only argument is an object.
    auto arg = args[0]->ToObject();

    // Get arguments to draw the font.
    auto font = GetObject<SpriteFont>(arg, "font");
    auto text = GetString(arg, "text");
    auto position = GetVector2(arg, "position");
    auto rotation = GetNumber(arg, "rotation");
    auto scaling = GetVector2(arg, "scaling", Vector2 { 1.0f, 1.0f });
    auto color = GetColor(arg, "color");
    auto origin = GetVector2(arg, "origin");

    try {
      self->DrawString(font, text, position, rotation, origin, scaling, color);
    }
    catch (std::exception& ex) {
      ScriptEngine::GetCurrent().ThrowTypeError(ex.what());
    }
  }

  static Vector2 GetVector2(v8::Handle<v8::Object> object, 
    std::string name, Vector2 defaultValue = { 0, 0 })
  {
    auto vector = GetObject(object, name);
    return Vector2 {
      GetNumber(vector, "x", defaultValue.x),
      GetNumber(vector, "y", defaultValue.y),
    };
  }

  static Rectangle GetRectangle(v8::Handle<v8::Object> object, 
    std::string name, Rectangle defaultValue = { 0, 0, 0, 0})
  {
    auto rectangle = GetObject(object, name);
    return Rectangle {
      GetNumber(rectangle, "x", defaultValue.x),
      GetNumber(rectangle, "y", defaultValue.y),
      GetNumber(rectangle, "width", defaultValue.width),
      GetNumber(rectangle, "height", defaultValue.height),
    };
  }

  static Color GetColor(v8::Handle<v8::Object> object, 
    std::string name, Color defaultValue = { 1.f, 1.f, 1.f, 1.f })
  {
    auto color = GetObject(object, name);
    return Color {
      GetNumber(color, "r", defaultValue.r),
      GetNumber(color, "g", defaultValue.g),
      GetNumber(color, "b", defaultValue.b),
      GetNumber(color, "a", defaultValue.a),
    };
  }

};

SpriteBatch::SpriteBatch(Window* window)
{
  Window::EnsureCurrentContext();

  // Attach the shaders used when drawing sprites.
  shaderProgram_.AttachShader(
    ShaderType::Vertex, SpriteShaders::vertexShaderSource);
  shaderProgram_.AttachShader(
    ShaderType::Geometry, SpriteShaders::geometryShaderSource);
  shaderProgram_.AttachShader(
    ShaderType::Fragment, SpriteShaders::fragmentShaderSource);

  // Link attached shaders to the program.
  shaderProgram_.Link();

  // Must use program before vertex attributes setup.
  shaderProgram_.Use();

  vertexRenderer_.SetupVertexAttributes([this]()
    { 
      SetSpriteVertexAttributes(&shaderProgram_);
    });

  auto w = (float)window->GetWidth();
  auto h = (float)window->GetHeight();

  // Set the ortho projection for the shader.
  auto projection = glm::ortho(0.0f, w, h, 0.0f, -1.0f, 1.0f);
  shaderProgram_.SetUniformValue(
    "projection", UniformDataType::Matrix4, glm::value_ptr(projection));
}

void SpriteBatch::Draw(Texture* texture, Vector2 position, float rotation, 
  Vector2 origin, Vector2 scaling, Color color, Rectangle source)
{
  if (texture == NULL) {
    throw std::runtime_error("Texture must be specified");
  }
  if (currentTexture_ != NULL && currentTexture_ != texture) {
    Flush();
  }
  Vector2 size = { 
    (float)texture->GetWidth(), 
    (float)texture->GetHeight() 
  };
  // Add to list of sprites to be drawn.
  sprites_.push_back(
    SpriteVertex { 
      position, origin, color, rotation, scaling, source, size, 0 
    });
  currentTexture_ = texture;
}

void SpriteBatch::DrawString(SpriteFont* font, std::string text, 
  Vector2 position, float rotation, Vector2 origin, Vector2 scaling, 
  Color color)
{
  if (font == NULL) {
    throw std::runtime_error("Font must be specified");
  }
  auto texture = font->GetTexture();
  if (currentTexture_ != NULL && currentTexture_ != texture) {
    Flush();
  }
  Vector2 size { 
    (float)texture->GetWidth(), 
    (float)texture->GetHeight() 
  };
  for (auto c: text) {
    auto glyph = font->GetGlyph(c);
    Vector2 charOrigin = { 
      origin.x - glyph.offset.x, 
      origin.y + glyph.offset.y
    };
    // Add character to list of sprites to be drawn.
    sprites_.push_back(
      SpriteVertex { 
        position, charOrigin, color, rotation, scaling, glyph.source, size, 1.f
      });
    origin.x -= glyph.advance.x;
    origin.y -= glyph.advance.y;
  }
  currentTexture_ = texture;
}

void SpriteBatch::Begin()
{
  glEnable(GL_BLEND);
  glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
  shaderProgram_.Use();
  currentTexture_ = NULL;
}

void SpriteBatch::End()
{
  Flush();
}

void SpriteBatch::Flush()
{
  if (currentTexture_ == NULL || sprites_.size() == 0) {
    return;
  }
  currentTexture_->Bind(0);
  vertexRenderer_.Draw(PrimitiveType::Point, sprites_);
  sprites_.clear();
}

void SpriteBatch::Init(Isolate* isolate, Handle<ObjectTemplate> parent)
{
  ScriptSpriteBatch::GetCurrent().Init(isolate, "SpriteBatch", parent);
}