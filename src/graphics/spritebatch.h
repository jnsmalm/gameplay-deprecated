#ifndef SPRITEBATCH_H
#define SPRITEBATCH_H

#include "graphics/types.h"
#include "graphics/texture.h"
#include "graphics/shader.h"
#include "graphics/vertexrenderer.h"
#include "graphics/shaderprogram.h"
#include "graphics/spritefont.h"

#include "v8.h"
#include <gl/glew.h>
#include <vector>
#include <string>

// Vertex to hold the sprite data.
struct SpriteVertex {

  struct Vector2 position;
  struct Vector2 origin;
  struct Color color;
  float rotation;
  struct Vector2 scaling;
  struct Rectangle atlasSource;
  struct Vector2 atlasSize;
  bool isText;

};

class SpriteBatch {

public:

  SpriteBatch();

  // Begin drawing sprites.
  void Begin();
  // End drawing sprites.
  void End();
  // Adds a sprite to the list to be drawn.
  void Draw(Texture* texture, struct Vector2 position, float rotation, 
    struct Vector2 origin, struct Vector2 scaling, struct Color color, 
    struct Rectangle source);
  // Draws text with the specified font.
  void DrawString(SpriteFont* font, std::string text, struct Vector2 position, 
    float rotation, struct Vector2 origin, struct Vector2 scaling, 
    struct Color color);

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