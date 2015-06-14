#ifndef SPRITEFONTGLYPH_H
#define SPRITEFONTGLYPH_H

#include <script/ObjectScript.h>
#include <map>

struct FontGlyph {
    char c;
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

class GlyphCollection : public ObjectScript<GlyphCollection> {

public:
    GlyphCollection(v8::Isolate *isolate) : ObjectScript(isolate) { }

    void Add(FontGlyph glyph) {
        glyphs_[glyph.c] = glyph;
    }

    FontGlyph Get(char c) {
        return glyphs_[c];
    }

private:
    static void GetGlyph(v8::Local<v8::String> name,
                         const v8::PropertyCallbackInfo<v8::Value> &info);
    virtual void Initialize() override;

    std::map<char, FontGlyph> glyphs_;
};

#endif
