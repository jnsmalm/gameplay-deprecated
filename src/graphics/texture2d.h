/*The MIT License (MIT)

Copyright (c) 2016 Jens Malmborg

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.*/

#ifndef GAMEPLAY_TEXTURE2D_H
#define GAMEPLAY_TEXTURE2D_H

#include <gl/glew.h>
#include "v8.h"
#include <string>
#include <script/script-object-wrap.h>
#include <vector>

enum class TextureFilter {
  Linear,
  Nearest,
};

enum class TextureWrap {
  Repeat,
  ClampToEdge
};

class Texture2D : public ScriptObjectWrap<Texture2D> {
public:
  Texture2D(v8::Isolate* isolate, std::string filename);
  Texture2D(v8::Isolate* isolate, int width, int height,
            GLenum internalFormat, GLenum format, GLenum type);
  ~Texture2D();

  void GetData(float* pixels);
  void SetData(std::vector<float> pixels);
  void SetFilter(TextureFilter filter);
  void SetWrap(TextureWrap wrap);

  static void New(const v8::FunctionCallbackInfo<v8::Value>& args);

  int channels() { return channels_; }
  int width() { return width_; }
  int height() { return height_; }
  TextureFilter filter() { return filter_; }
  TextureWrap wrap() { return wrap_; }
  GLuint glTexture() { return glTexture_; }

protected:
  virtual void Initialize() override;

private:
  GLuint glTexture_;
  GLenum glInternalFormat_;
  GLenum glFormat_;
  GLenum glType_;
  TextureFilter filter_;
  TextureWrap wrap_;
  int width_;
  int height_;
  int channels_;
};

#endif // GAMEPLAY_TEXTURE2D_H