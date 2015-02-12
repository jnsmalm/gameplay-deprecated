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

struct SpriteVertex {

  // Position of the sprite to be drawn.
  Vector2 position;
  // Origin of the sprite. This will affect the position and rotation.
  Vector2 origin;
  // Color for the sprite (values should be in range 0.0-1.0).
  Color color;
  // Rotates the sprite around it's origin (value should be in radians).
  float rotation;
  // Scales the sprite.
  Vector2 scaling;
  // The source rectangle of the texture to draw.
  Rectangle atlasSource;
  // The total size of the texture used.
  Vector2 atlasSize;
  // Specifies if the sprite should be drawn as text. 
  float text;

};

class SpriteBatch {

public:

  SpriteBatch();

  // Begin drawing sprites.
  void Begin();
  // End drawing sprites.
  void End();
  // Adds a sprite to the list to be drawn.
  void Draw(Texture* texture, Vector2 position, float rotation, Vector2 origin,
    Vector2 scaling, Color color, Rectangle source);
  // Draws text with the specified font.
  void DrawString(SpriteFont* font, std::string text, Vector2 position, 
    float rotation, Vector2 origin, Vector2 scaling, Color color);

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