#ifndef SPRITEBATCH_H
#define SPRITEBATCH_H

#include "vertexrenderer.h"
#include "shaderprogram.h"

#include "v8.h"
#include <gl/glew.h>
#include <vector>

// Vertex to hold the sprite data.
struct SpriteVertex {

  float position[2];
  float color[3];
  float rotation[3];
  float size[2];
  float scaling[2];

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
  void Draw(Texture* texture, float x, float y, float rotation = 0, 
    float scaling = 1);

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