#ifndef SPRITEBATCH_H
#define SPRITEBATCH_H

#include "graphics/vertexrenderer.h"
#include "graphics/shaderprogram.h"
#include "graphics/spritefont.h"

#include "v8.h"
#include <gl/glew.h>
#include <vector>
#include <string>

// Vertex to hold the sprite data.
struct SpriteVertex {

  float position[2];
  float color[3];
  float rotation[3];
  float size[2];
  float scaling[2];
  float rect[4];

};

struct Rect {

  float x;
  float y;
  float w;
  float h;

};

class Texture;
class Shader;

class SpriteBatch {

public:

  SpriteBatch();

  // Begin drawing sprites.
  void Begin();
  // End drawing sprites.
  void End();
  // Adds a sprite to the list to be drawn.
  void Draw(Texture* texture, float x, float y, Rect rect, float rotation = 0, 
    float scaling = 1);
  // Draw text with the specified font.
  void DrawString(SpriteFont* font, std::string text, float x, float y);

  // Creates a new script instance.
  static void New(const v8::FunctionCallbackInfo<v8::Value>& args);

private:

  // Draw the sprites currently in the list.
  void Flush();

  std::vector<SpriteVertex> sprites_;
  VertexRenderer<SpriteVertex> vertexRenderer_;
  ShaderProgram shaderProgram_;
  Texture* currentTexture_;

};

#endif