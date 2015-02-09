#ifndef SPRITEFONT_H
#define SPRITEFONT_H

#include "graphics/texture.h"
#include "graphics/types.h"

#include <map>
#include <string>
#include "v8.h"
#include "ft2build.h"
#include FT_FREETYPE_H

struct FontGlyph {

  struct Rectangle source;
  struct Point offset;
  struct Point advance;

};

class SpriteFont {

  class ScriptSpriteFont;

public:

  SpriteFont(std::string filename, int size, std::string chars);
  ~SpriteFont();

  // Gets the size for the specified text.
  Size MeasureString(std::string text);
  // Gets the glyph for the specified character.
  FontGlyph GetGlyph(char c) { return glyphs_[c]; }
  // Gets the texture atlas used for the font.
  Texture* GetTexture() { return texture_; }

  // Creates a new script instance.
  static void New(const v8::FunctionCallbackInfo<v8::Value>& args);

private:

  // Setup the specified characters and create the font texture.
  void SetupGlyphs(FT_Face face, std::string chars);
  // Places a character glyph on the font texture.
  void PlaceGlyph(FT_Face face, FontGlyph* glyph, float x, float y);

  Texture* texture_;
  std::map<char, FontGlyph> glyphs_;
  int maxGlyphHeight_;

};

#endif