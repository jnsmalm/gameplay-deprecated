#include "graphics/spritebatch.h"
#include "graphics/shader.h"
#include "script/scriptargs.h"
#include "graphics/texture.h"
#include "script/scriptobject.h"
#include "graphics/spriteshaders.h"
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
  shaderProgram->SetVertexAttribute("color", 
    3, sizeof(SpriteVertex), poffsetof(SpriteVertex, color));
  shaderProgram->SetVertexAttribute("rotation", 
    3, sizeof(SpriteVertex), poffsetof(SpriteVertex, rotation));
  shaderProgram->SetVertexAttribute("size", 
    2, sizeof(SpriteVertex), poffsetof(SpriteVertex, size));
  shaderProgram->SetVertexAttribute("scaling", 
    2, sizeof(SpriteVertex), poffsetof(SpriteVertex, scaling));
  shaderProgram->SetVertexAttribute("rect", 
    4, sizeof(SpriteVertex), poffsetof(SpriteVertex, rect));
}

// Helps with setting up the script object.
class ScriptSpriteBatch {

public:

  static void Begin(const FunctionCallbackInfo<Value>& args)
  {
    auto self = ScriptArgs::GetThis<SpriteBatch>(args);
    self->Begin();
  }

  static void End(const FunctionCallbackInfo<Value>& args)
  {
    auto self = ScriptArgs::GetThis<SpriteBatch>(args);
    self->End();
  }

  static void Draw(const FunctionCallbackInfo<Value>& args)
  {
    try {
      auto self = ScriptArgs::GetThis<SpriteBatch>(args);

      // Get arguments to draw the sprite.
      auto texture = ScriptArgs::GetObject<Texture>(args, 0);
      auto x = ScriptArgs::GetNumber(args, 1);
      auto y = ScriptArgs::GetNumber(args, 2);
      auto rotation = ScriptArgs::GetNumber(args, 3);
      auto scaling = ScriptArgs::GetNumber(args, 4);

      Rect rect;
      rect.x = 0;
      rect.y = 0;
      rect.w = texture->GetWidth();
      rect.h = texture->GetHeight();

      self->Draw(texture, x, y, rect, rotation, scaling);
    }
    catch (std::exception& ex) {
      ScriptEngine::GetCurrent().ThrowTypeError(ex.what());
    }
  }

  static void DrawString(const FunctionCallbackInfo<Value>& args)
  {
    try {
      auto self = ScriptArgs::GetThis<SpriteBatch>(args);

      // Get arguments to draw the sprite.
      auto font = ScriptArgs::GetObject<SpriteFont>(args, 0);
      auto text = ScriptArgs::GetString(args, 1);
      auto x = ScriptArgs::GetNumber(args, 2);
      auto y = ScriptArgs::GetNumber(args, 3);

      self->DrawString(font, text, x, y);
    }
    catch (std::exception& ex) {
      ScriptEngine::GetCurrent().ThrowTypeError(ex.what());
    }
  }

  static void Setup(Local<ObjectTemplate> tmpl)
  {
    ScriptObject::BindFunction(tmpl, "begin", Begin);
    ScriptObject::BindFunction(tmpl, "end", End);
    ScriptObject::BindFunction(tmpl, "draw", Draw);
    ScriptObject::BindFunction(tmpl, "drawString", DrawString);
  }

};

}

SpriteBatch::SpriteBatch()
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

  // Set the ortho projection for the shader.
  auto projection = glm::ortho(0.0f, 1024.0f, 576.0f, 0.0f, -1.0f, 1.0f);
  shaderProgram_.SetUniformValue(
    "projection", UniformDataType::Matrix4, glm::value_ptr(projection));
}

void SpriteBatch::Draw(
  Texture* texture, float x, float y, Rect rect, float rotation, float scaling)
{
  if (!texture) {
    throw std::runtime_error("Invalid texture");
  }
  if (currentTexture_ != NULL && currentTexture_ != texture) {
    Flush();
  }
  sprites_.push_back(
    SpriteVertex 
    {
      // Position
      { x, y },
      // Color
      { 1.0f, 1.0f, 1.0f },
      // Rotation
      { 0.0f, 0.0f, rotation },
      // Size
      { (float)texture->GetWidth(), (float)texture->GetHeight() },
      // Scaling
      { scaling, scaling },
      // Rect
      { rect.x, rect.y, rect.w, rect.h },
    });
  currentTexture_ = texture;
}

void SpriteBatch::DrawString(SpriteFont* font, std::string text, float x, float y)
{
  glBindTexture(GL_TEXTURE_2D, font->glTexture_);

  auto apa = 0.0f;
  auto mus = 0.0f;

  for (auto c:text) {

    auto glyph = font->GetGlyph(c);

    sprites_.push_back(
      SpriteVertex 
      {
        // Position
        { x + glyph.offset.x, y - glyph.offset.y },
        // Color
        { 1.0f, 0.0f, 0.0f },
        // Rotation
        { -apa, -mus, 0.0f },
        // Size
        { (float)1024, (float)1024 },
        // Scaling
        { 1.0, 1.0 },
        // Rect
        { glyph.position.x, glyph.position.y, glyph.size.x, glyph.size.y },
      });

    apa += (glyph.advance.x);
    mus += (glyph.advance.y);

  }

  vertexRenderer_.Draw(PrimitiveType::Point, sprites_);

  sprites_.clear();



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

void SpriteBatch::New(const FunctionCallbackInfo<Value>& args)
{
  try {
    // Create spritebacth and wrap in a script object.
    auto spriteBatch = new SpriteBatch();
    auto object = ScriptObject::Wrap(spriteBatch, ScriptSpriteBatch::Setup);

    // Set script object as the result.
    ScriptArgs::SetObjectResult(args, object);
  }
  catch (std::exception& ex) {
    ScriptEngine::GetCurrent().ThrowTypeError(ex.what());
  }
}