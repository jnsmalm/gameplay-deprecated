#ifndef SPRITEFONT_H
#define SPRITEFONT_H

#include "graphics/texture.h"
#include <map>
#include <string>
#include "v8.h"
#include "ft2build.h"
#include FT_FREETYPE_H
#include "glyph-collection.h"

struct SpriteFontGlyph {
    struct Rectangle {
        int x;
        int y;
        int w;
        int h;
    } source;
    struct Point {
        int x;
        int y;
    } offset;
    Point advance;
};

class SpriteFont : public ObjectScript<SpriteFont> {

public:

  SpriteFont(v8::Isolate* isolate, std::string filename, int size,
             std::string chars);
  ~SpriteFont();

    static void New(const v8::FunctionCallbackInfo<v8::Value>& args);
    int MeasureString(std::string text);

    GlyphCollection* glyphs() { return &glyphs_; }
  Texture* texture() { return texture_; }

private:
    virtual void Initialize() override;
    void SetupGlyphs(FT_Face face, std::string chars);
  void PlaceGlyph(FT_Face face, SpriteFontGlyph* glyph, float x, float y);
    static void MeasureString(const v8::FunctionCallbackInfo<v8::Value>& args);

  GlyphCollection glyphs_;
    Texture* texture_;
  int maxGlyphHeight_;
};

#endif