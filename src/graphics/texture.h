#ifndef TEXTURE_H
#define TEXTURE_H

#include "script/scriptobject.h"

#include <gl/glew.h>
#include "v8.h"
#include <string>

class Texture {

  friend class GraphicsDevice;

  // Class that is only available to texture.
  class ScriptTexture;

public:

  Texture(std::string filename);
  Texture(int width, int height, GLenum format);
  ~Texture();

  // Binds the texture to the specified unit.
  void Bind(int unit);
  // Gets the width of the texture.
  int GetWidth() { return width_; }
  // Gets the height of the texture.
  int GetHeight() { return height_; }

  // Initializes the script object.
  static void InstallScript(
    v8::Isolate* isolate, v8::Handle<v8::ObjectTemplate> global);

private:

  GLuint glTexture_;
  int width_;
  int height_;

};

#endif