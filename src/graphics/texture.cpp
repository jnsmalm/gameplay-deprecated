#include "graphics/texture.h"
#include "script/scriptengine.h"
#include "script/scriptargs.h"
#include "script/scriptobject.h"
#include "graphics/window.h"

#include "freeimage.h"
#include <vector>

namespace {

// Helps with setting up the script object.
class ScriptTexture {

public:

  static void GetWidth(
    v8::Local<v8::String> name, const v8::PropertyCallbackInfo<v8::Value>& args)
  {
    auto texture = ScriptArgs::GetThis<Texture>(args);
    ScriptArgs::SetNumberResult(args, texture->GetWidth());
  }

  static void GetHeight(
    v8::Local<v8::String> name, const v8::PropertyCallbackInfo<v8::Value>& args)
  {
    auto texture = ScriptArgs::GetThis<Texture>(args);
    ScriptArgs::SetNumberResult(args, texture->GetHeight());
  }

  static void Setup(v8::Local<v8::ObjectTemplate> tmpl)
  {
    ScriptObject::BindProperty(tmpl, "width", GetWidth);
    ScriptObject::BindProperty(tmpl, "height", GetHeight);
  }

};

}

Texture::Texture(std::string filename)
{
  Window::EnsureCurrentContext();

  // Load the image for the texture.
  auto img = FreeImage_ConvertTo32Bits(
   FreeImage_Load(FreeImage_GetFileType(filename.c_str()), filename.c_str()));

  if (!img) {
    throw std::runtime_error("Failed to load image '" + filename + "'");
  }

  width_ = FreeImage_GetWidth(img);
  height_ = FreeImage_GetHeight(img);

  // Create a new texture.
  glGenTextures(1, &glTexture_);
  glActiveTexture(GL_TEXTURE0);
  glBindTexture(GL_TEXTURE_2D, glTexture_);

  // Set texture filtering.
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);

  // Set image data to the created texture.
  glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, width_, height_, 0, GL_BGRA, 
    GL_UNSIGNED_BYTE, FreeImage_GetBits(img));

  FreeImage_Unload(img);
}

Texture::Texture(int width, int height, GLenum format)
{
  Window::EnsureCurrentContext();

  // Create a new texture.
  glGenTextures(1, &glTexture_);
  glActiveTexture(GL_TEXTURE0);
  glBindTexture(GL_TEXTURE_2D, glTexture_);

  // Empty texture data.
  std::vector<GLubyte> emptyData(width * height * 4, 0);
  glTexImage2D(GL_TEXTURE_2D, 0, format, width, height, 0, format, 
    GL_UNSIGNED_BYTE, &emptyData[0]);

  width_ = width;
  height_ = height;
}

Texture::~Texture()
{
  glDeleteTextures(1, &glTexture_);
}

void Texture::Bind(int unit)
{
  switch (unit) {
    case 1:
      glActiveTexture(GL_TEXTURE1);
      break;
    case 2:
      glActiveTexture(GL_TEXTURE2);
      break;
    case 3:
      glActiveTexture(GL_TEXTURE3);
      break;
    default:
      glActiveTexture(GL_TEXTURE0);
  }
  glBindTexture(GL_TEXTURE_2D, glTexture_);
}

void Texture::New(const v8::FunctionCallbackInfo<v8::Value>& args)
{
  try {
    // Get the filename argument.
    auto filename = ScriptArgs::GetString(args, 0);

    // Create texture and wrap in a script object.
    auto texture = new Texture(filename);
    auto object = ScriptObject::Wrap(texture, ScriptTexture::Setup);

    // Set script object as the result.
    ScriptArgs::SetObjectResult(args, object);
  }
  catch (std::exception& ex) {
    ScriptEngine::GetCurrent().ThrowTypeError(ex.what());
  }
}