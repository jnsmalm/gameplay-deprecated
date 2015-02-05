#ifndef SPRITEFONT_H
#define SPRITEFONT_H

#include <gl/glew.h>
#include <map>
#include <string>
#include "v8.h"
#include "ft2build.h"
#include FT_FREETYPE_H

struct Vector2 {

  float x;
  float y; 

};

struct Glyph {

  struct Vector2 position;
  struct Vector2 size;
  struct Vector2 offset;
  struct Vector2 advance;

};

class SpriteFont {

  class ScriptSpriteFont;

  friend class SpriteBatch;

public:

  SpriteFont(std::string filename, int size, std::string chars);
  ~SpriteFont();

  // Gets the glyph for the specified character.
  Glyph GetGlyph(char c) { return glyphs_[c]; }

  // Creates a new script instance.
  static void New(const v8::FunctionCallbackInfo<v8::Value>& args);

private:

  GLuint glTexture_;
  std::map<char, Glyph> glyphs_;

};

#endif