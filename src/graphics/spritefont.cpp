#include "graphics/spritefont.h"
#include "graphics/texture.h"
#include "script/scriptargs.h"
#include "script/scriptengine.h"
#include "script/scriptvalue.h"

#include <gl/glew.h>

using namespace v8;

namespace {

FontGlyph LoadGlyph(FT_Face face, char c)
{
  // Load glyph char and check for error.
  auto error = FT_Load_Char(face, c, FT_LOAD_RENDER);
  if (error) {
    throw std::runtime_error("Failed to load font character");
  }

  FontGlyph glyph;

  glyph.source.width = (float)face->glyph->bitmap.width;
  glyph.source.height = (float)face->glyph->bitmap.rows;
  glyph.offset.x = (float)face->glyph->bitmap_left;
  glyph.offset.y = (float)face->glyph->bitmap_top;

  // We increment the pen position with the vector slot->advance, which 
  // correspond to the glyph's advance width (also known as its escapement). 
  // The advance vector is expressed in 1/64th of pixels, and is truncated to 
  // integer pixels on each iteration.
  glyph.advance.x = (float)(face->glyph->advance.x >> 6);
  glyph.advance.y = (float)(face->glyph->advance.y >> 6);

  return glyph;
}

}

// Helps with setting up the script object.
class SpriteFont::ScriptSpriteFont {

public:

  static void MeasureString(const FunctionCallbackInfo<Value>& args) 
  {
    auto self = ScriptArgs::GetSelf<SpriteFont>(args);
    auto text = ScriptValue::ToString(args[0]);
    ScriptArgs::SetNumberResult(args, self->MeasureString(text).width);
  }

  static void Setup(Local<ObjectTemplate> tmpl)
  {
    ScriptObject::BindFunction(tmpl, "measureString", MeasureString);
  }

};

SpriteFont::SpriteFont(std::string filename, int size, std::string chars)
{
  FT_Library library;
  FT_Face face;

  // Initialize freetype library and check for error.
  auto error = FT_Init_FreeType(&library);
  if (error) {
    throw std::runtime_error("Failed to initialize font library");
  }

  // Load the specified font and check for error.
  error = FT_New_Face(library, filename.c_str(), 0, &face);
  if (error) {
    throw std::runtime_error("Failed to load font '" + filename + "'");
  }

  // Set the font size height in pixels.
  FT_Set_Pixel_Sizes(face, 0, size);

  SetupGlyphs(face, chars);

  FT_Done_Face(face);
  FT_Done_FreeType(library);
}

SpriteFont::~SpriteFont()
{
  delete texture_;
}

Size SpriteFont::MeasureString(std::string text)
{
  Size size = { 0, 0 };
  for (int i = 0; i < text.length(); i++) {
    auto glyph = glyphs_[text.at(i)];
    if (glyph.source.height > size.height) {
      size.height = glyph.source.height;
    }
    /*if (i == text.length() - 1) {
      size.width += glyph.source.width;
    }
    else {
      size.width += glyph.advance.x;
    }*/
    //size.width += glyph.source.width;
      size.width += glyph.advance.x;
  }
  return size;
}

void SpriteFont::SetupGlyphs(FT_Face face, std::string chars)
{
  // Create texture used for placing the glyphs.
  texture_ = new Texture(1024, 1024, GL_RED);

  // Set texture filtering.
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);

  Point position = { 0, 0 };
  maxGlyphHeight_ = 0;

  // It is also very important to disable the default 4-byte alignment 
  // restrictions that OpenGL uses for uploading textures and other data. 
  // Normally you won't be affected by this restriction, as most textures have 
  // a width that is a multiple of 4, and/or use 4 bytes per pixel. The glyph 
  // images are in a 1-byte greyscale format though, and can have any possible 
  // width. To ensure there are no alignment restrictions, we have to use:
  glPixelStorei(GL_UNPACK_ALIGNMENT, 1);

  for (auto c: chars) {
    // Load glyph and place it on texture.
    auto glyph = LoadGlyph(face, c);
    PlaceGlyph(face, &glyph, position.x, position.y);

    position.x = glyph.source.x + glyph.source.width + 1;
    position.y = glyph.source.y;

    // Store glyph in map for lookup.
    glyphs_[c] = glyph;
  }

  glPixelStorei(GL_UNPACK_ALIGNMENT, 4);
}

void SpriteFont::PlaceGlyph(FT_Face face, FontGlyph* glyph, float x, float y)
{
  if (glyph->source.height > maxGlyphHeight_) {
    maxGlyphHeight_ = glyph->source.height;
  }

  if (x + glyph->source.width > texture_->GetWidth()) {
    x = 0;
    y += maxGlyphHeight_;
    maxGlyphHeight_ = 0;
  }

  if (y + glyph->source.height > texture_->GetHeight()) {
    throw std::runtime_error("Could not fit all characters on font texture");
  }

  glyph->source.x = x;
  glyph->source.y = y;

  auto bitmap = face->glyph->bitmap;

  // Place glyph bitmap data on texture.
  glTexSubImage2D(GL_TEXTURE_2D, 0, (GLint)x, (GLint)y, bitmap.width, 
    bitmap.rows, GL_RED, GL_UNSIGNED_BYTE, bitmap.buffer);
}

void SpriteFont::New(const v8::FunctionCallbackInfo<v8::Value>& args)
{
  try {
    // Get the arguments for creating a sprite font.
    auto filename = ScriptArgs::GetString(args, 0);
    auto size = ScriptArgs::GetNumber(args, 1);
    auto chars = ScriptArgs::GetString(args, 2);

    // Create sprite font and wrap in a script object.
    auto spriteFont = new SpriteFont(filename, size, chars);
    auto object = ScriptObject::Create(
      args.GetIsolate(), spriteFont, SpriteFont::ScriptSpriteFont::Setup);

    // Set script object as the result.
    args.GetReturnValue().Set(object);
  }
  catch (std::exception& ex) {
    ScriptEngine::GetCurrent().ThrowTypeError(ex.what());
  }
}