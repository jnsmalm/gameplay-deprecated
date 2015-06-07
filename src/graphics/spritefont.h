#ifndef SPRITEFONT_H
#define SPRITEFONT_H

#include "graphics/texture.h"
//#include "graphics/types.h"

#include <map>
#include <string>
#include "v8.h"
#include "ft2build.h"
#include FT_FREETYPE_H

/*struct FontGlyph {

  struct Rectangle source;
  struct Point offset;
  struct Point advance;

};

class SpriteFont {

  // Class that is only available to spritefont.
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

  // Initializes the script object.
  static void InstallScript(
    v8::Isolate* isolate, v8::Handle<v8::ObjectTemplate> global);

  Texture* texture_;

private:

  // Setup the specified characters and create the font texture.
  void SetupGlyphs(FT_Face face, std::string chars);
  // Places a character glyph on the font texture.
  void PlaceGlyph(FT_Face face, FontGlyph* glyph, float x, float y);

  
  std::map<char, FontGlyph> glyphs_;
  int maxGlyphHeight_;

};*/

#endif