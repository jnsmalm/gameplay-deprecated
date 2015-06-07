#ifndef TEXTURE_H
#define TEXTURE_H

#include "script/scriptobject.h"

#include <gl/glew.h>
#include "v8.h"
#include <string>
#include <script/ObjectScript.h>

class Texture : public ObjectScript<Texture> {

  friend class GraphicsDevice;

public:
  Texture(v8::Isolate* isolate, std::string filename);
  Texture(int width, int height, GLenum format);
  ~Texture();

  int GetWidth() { return width_; }
  int GetHeight() { return height_; }

  static void New(const v8::FunctionCallbackInfo<v8::Value>& args);

private:
  virtual void Initialize() override;

  static void GetWidth(v8::Local<v8::String> name,
                       const v8::PropertyCallbackInfo<v8::Value>& args);
  static void GetHeight(v8::Local<v8::String> name,
                        const v8::PropertyCallbackInfo<v8::Value>& args);

  GLuint glTexture_;
  int width_;
  int height_;
};

#endif