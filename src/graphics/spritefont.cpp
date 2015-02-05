#include "graphics/spritefont.h"
#include "script/scriptargs.h"
#include "script/scriptengine.h"

#include <vector>
#include <algorithm>

using namespace v8;

namespace {

GLuint CreateEmptyTexture(int width, int height)
{
  GLuint texture;

  // Create a new texture.
  glGenTextures(1, &texture);
  glActiveTexture(GL_TEXTURE0);
  glBindTexture(GL_TEXTURE_2D, texture);

  // Fill texture with empty data.
  std::vector<GLubyte> emptyData(width * height * 4, 150);
  glTexImage2D(GL_TEXTURE_2D, 0, GL_RED, width, height, 
    0, GL_RED, GL_UNSIGNED_BYTE, &emptyData[0]);

  return texture;
}

Glyph LoadGlyph(FT_Face face, char c)
{
  // Load glyph char and check for error.
  auto error = FT_Load_Char(face, c, FT_LOAD_RENDER);
  if (error) {
    throw std::runtime_error("Failed to load char");
  }

  Glyph glyph;

  // Get glyph information for future reference.
  glyph.size.x = (float)face->glyph->bitmap.width;
  glyph.size.y = (float)face->glyph->bitmap.rows;
  glyph.offset.x = (float)face->glyph->bitmap_left;
  glyph.offset.y = (float)face->glyph->bitmap_top;
  glyph.advance.x = (float)(face->glyph->advance.x >> 6);
  glyph.advance.y = (float)(face->glyph->advance.y >> 6);

  return glyph;
}

}

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

  glTexture_ = CreateEmptyTexture(1024, 1024);

  // Set texture filtering.
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);

  glPixelStorei(GL_UNPACK_ALIGNMENT, 1);

  int x = 0;
  int y = 0;

  int maxGlyphHeight = 0;

  auto slot = face->glyph;

  for (auto c: chars) {

    auto glyph = LoadGlyph(face, c);
    maxGlyphHeight = std::max(maxGlyphHeight, (int)glyph.size.y);

    if (x + glyph.size.x > 1024) {
      x = 0;
      y += maxGlyphHeight;
      maxGlyphHeight = 0;
    }

    if (y + glyph.size.y > 1024) {
      printf("full\n");
      break;
    }

    glyph.position.x = (float)x;
    glyph.position.y = (float)y;

    // Write glyph bitmap data to texture.
    glTexSubImage2D(GL_TEXTURE_2D, 0, x, y, slot->bitmap.width, 
      slot->bitmap.rows, GL_RED, GL_UNSIGNED_BYTE, slot->bitmap.buffer);

    glyphs_[c] = glyph;

    x += glyph.size.x;
    



    /*x = glyphs_[c].position.x;
    y = glyphs_[c].position.x;*/
  }

  FT_Done_Face(face);
  FT_Done_FreeType(library);

  glPixelStorei(GL_UNPACK_ALIGNMENT, 4);
}

SpriteFont::~SpriteFont()
{
  glDeleteTextures(1, &glTexture_);
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
    auto object = ScriptObject::Wrap(spriteFont, NULL);

    // Set script object as the result.
    ScriptArgs::SetObjectResult(args, object);
  }
  catch (std::exception& ex) {
    ScriptEngine::GetCurrent().ThrowTypeError(ex.what());
  }
}