#ifndef TEXTURE_H
#define TEXTURE_H

#include <gl/glew.h>
#include "v8.h"
#include <string>

class Texture {

public:

  Texture(std::string filename);
  ~Texture();

  // Binds the texture to the specified unit.
  void Bind(int unit);
  // Gets the width of the texture.
  int GetWidth() { return width_; }
  // Gets the height of the texture.
  int GetHeight() { return height_; }

  // Creates a new script instance.
  static void New(const v8::FunctionCallbackInfo<v8::Value>& args);

private:

  GLuint glTexture_;
  int width_;
  int height_;

};

#endif