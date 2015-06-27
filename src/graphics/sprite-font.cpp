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

#include "sprite-font.h"
#include "graphics/texture.h"
#include "script/scriptengine.h"
#include "script/scripthelper.h"

using namespace v8;

SpriteFont::SpriteFont(v8::Isolate *isolate, std::string filename, int size,
                       std::string chars) : ObjectScript(isolate),
                                            glyphs_(isolate) {

    texture_ = new Texture(isolate, 1024, 1024, GL_RED);
    texture_->InstallAsObject("texture", this->getObject());
    glyphs_.InstallAsObject("glyphs", this->getObject());

    FT_Library library;
    auto error = FT_Init_FreeType(&library);
    if (error) {
        throw std::runtime_error("Failed to initialize font library");
    }
    error = FT_New_Face(library, filename.c_str(), 0, &face_);
    if (error) {
        throw std::runtime_error("Failed to load font '" + filename + "'");
    }
    FT_Set_Pixel_Sizes(face_, 0, size);
    SetupGlyphs(chars);
    FT_Done_Face(face_);
    FT_Done_FreeType(library);
}

SpriteFont::~SpriteFont() {
    delete texture_;
}

void SpriteFont::New(const v8::FunctionCallbackInfo<v8::Value>& args) {
    HandleScope scope(args.GetIsolate());
    ScriptHelper helper(args.GetIsolate());

    auto arg = args[0]->ToObject();
    auto filename = ScriptEngine::GetCurrent().GetExecutionPath() +
                    helper.GetString(arg, "filename");
    auto size = helper.GetInteger(arg, "size", 20);
    auto chars = helper.GetString(arg, "chars",
            "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.,"
            "[0123456789] (!?&-+=*/:+%@)");

    try {
        auto spriteFont = new SpriteFont(
                args.GetIsolate(), filename, size, chars);
        args.GetReturnValue().Set(spriteFont->getObject());
    }
    catch (std::exception& ex) {
        ScriptEngine::GetCurrent().ThrowTypeError(ex.what());
    }
}

SpriteFontGlyph SpriteFont::LoadGlyph(char c) {
    auto error = FT_Load_Char(face_, c, FT_LOAD_RENDER);
    if (error) {
        throw std::runtime_error("Failed to load font character");
    }
    SpriteFontGlyph glyph;
    glyph.offset.x = face_->glyph->bitmap_left;
    glyph.offset.y = face_->glyph->bitmap_top;
    glyph.source.w = face_->glyph->bitmap.width;
    glyph.source.h = face_->glyph->bitmap.rows;
    // We increment the pen position with the vector slot->advance, which
    // correspond to the glyph's advance width (also known as its escapement).
    // The advance vector is expressed in 1/64th of pixels, and is truncated to
    // integer pixels on each iteration.
    glyph.advance.x = (face_->glyph->advance.x >> 6);
    glyph.advance.y = (face_->glyph->advance.y >> 6);
    return glyph;
}

void SpriteFont::SetupGlyphs(std::string chars) {
    // It is also very important to disable the default 4-byte alignment
    // restrictions that OpenGL uses for uploading textures and other data.
    // Normally you won't be affected by this restriction, as most textures have
    // a width that is a multiple of 4, and/or use 4 bytes per pixel. The glyph
    // images are in a 1-byte greyscale format though, and can have any possible
    // width. To ensure there are no alignment restrictions, we have to use:
    glPixelStorei(GL_UNPACK_ALIGNMENT, 1);

    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);

    int x = 0, y = 0;
    for (auto c: chars) {
        auto glyph = LoadGlyph(c);
        PlaceGlyph(&glyph, x, y);
        x = glyph.source.x + glyph.source.w + 1;
        y = glyph.source.y;
        glyphs_[c] = glyph;
    }

    glPixelStorei(GL_UNPACK_ALIGNMENT, 4);
}

void SpriteFont::PlaceGlyph(SpriteFontGlyph* glyph, int x, int y) {
    if (glyph->source.h > maxGlyphHeight_) {
        maxGlyphHeight_ = glyph->source.h;
    }
    if (x + glyph->source.w > texture_->GetWidth()) {
        x = 0;
        y += maxGlyphHeight_;
        maxGlyphHeight_ = glyph->source.h;
    }
    if (y + glyph->source.h > texture_->GetHeight()) {
        throw std::runtime_error(
                "Could not fit all characters on font texture");
    }
    glyph->source.x = x;
    glyph->source.y = y;
    auto bitmap = face_->glyph->bitmap;
    glTexSubImage2D(GL_TEXTURE_2D, 0, (GLint)x, (GLint)y, bitmap.width,
                    bitmap.rows, GL_RED, GL_UNSIGNED_BYTE, bitmap.buffer);
}

void SpriteFont::Initialize() {
    ObjectScript::Initialize();
    SetFunction("measureString", MeasureString);
}

int SpriteFont::MeasureString(std::string text) {
    int size = 0;
    for (int i = 0; i < text.length(); i++) {
        auto glyph = glyphs_[text.at(i)];
        size += glyph.advance.x;
    }
    return size;
}

void SpriteFont::MeasureString(
        const v8::FunctionCallbackInfo<v8::Value> &args) {
    HandleScope scope(args.GetIsolate());
    ScriptHelper helper(args.GetIsolate());
    auto self = GetInternalObject(args.Holder());
    auto text = helper.GetString(args[0]);
    auto size = self->MeasureString(text);
    args.GetReturnValue().Set(size);
}
