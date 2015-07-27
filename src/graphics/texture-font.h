/*The MIT License (MIT)

JSPlay Copyright (c) 2015 Jens Malmborg

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

#ifndef JSPLAY_FONTTEXTURE_H
#define JSPLAY_FONTTEXTURE_H

#include "texture2d.h"
#include <map>
#include <string>
#include "v8.h"
#include "ft2build.h"
#include FT_FREETYPE_H
#include "glyph-collection.h"

struct TextureFontGlyph {
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

class TextureFont : public ScriptObjectWrap<TextureFont> {

public:
    TextureFont(v8::Isolate* isolate,
               std::string filename, int size, std::string chars);
    ~TextureFont();

    static void New(const v8::FunctionCallbackInfo<v8::Value>& args);
    int MeasureString(std::string text);

    GlyphCollection* glyphs() { return &glyphs_; }
    Texture2D* texture() { return texture_; }

protected:
    virtual void Initialize() override;

private:
    TextureFontGlyph LoadGlyph(char c);
    void SetupGlyphs(std::string chars);
    void PlaceGlyph(TextureFontGlyph * glyph, int x, int y);
    static void MeasureString(const v8::FunctionCallbackInfo<v8::Value>& args);

    GlyphCollection glyphs_;
    Texture2D * texture_ = nullptr;
    FT_Face face_;
    int maxGlyphHeight_ = 0;
};

#endif // JSPLAY_FONTTEXTURE_H