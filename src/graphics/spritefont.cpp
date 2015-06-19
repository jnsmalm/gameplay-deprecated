#include "graphics/spritefont.h"
#include "graphics/texture.h"
#include "script/scriptengine.h"
#include "script/scripthelper.h"

using namespace v8;

namespace {

    SpriteFontGlyph LoadGlyph(FT_Face face, char c) {
  // Load glyph char and check for error.
  auto error = FT_Load_Char(face, c, FT_LOAD_RENDER);
  if (error) {
    throw std::runtime_error("Failed to load font character");
  }

        SpriteFontGlyph glyph;

  glyph.source.w = (float)face->glyph->bitmap.width;
  glyph.source.h = (float)face->glyph->bitmap.rows;
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

SpriteFont::SpriteFont(v8::Isolate *isolate, std::string filename, int size,
                       std::string chars) : ObjectScript(isolate), glyphs_(isolate) {
    //glyphs_ = new GlyphCollection(isolate);
    glyphs_.InstallAsObject("glyphs", this->getObject());

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
    //delete glyphs_;
    delete texture_;
}

void SpriteFont::New(const v8::FunctionCallbackInfo<v8::Value>& args)
{
    HandleScope scope(args.GetIsolate());
    ScriptHelper helper(args.GetIsolate());

    auto arg = args[0]->ToObject();
    auto filename = ScriptEngine::GetCurrent().GetExecutionPath() +
                    helper.GetString(arg, "filename");
    auto size = helper.GetInteger(arg, "size", 20);
    auto chars = helper.GetString(arg, "chars");

    try {
        auto spriteFont = new SpriteFont(args.GetIsolate(), filename, size,
                                           chars);
        args.GetReturnValue().Set(spriteFont->getObject());
    }
    catch (std::exception& ex) {
        ScriptEngine::GetCurrent().ThrowTypeError(ex.what());
    }
}

void SpriteFont::SetupGlyphs(FT_Face face, std::string chars)
{
  // Create texture used for placing the glyphs.
  texture_ = new Texture(isolate(), 1024, 1024, GL_RED);
    texture_->InstallAsObject("texture", this->getObject());

  // Set texture filtering.
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);

  int x = 0, y = 0;
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
    PlaceGlyph(face, &glyph, x, y);

    x = glyph.source.x + glyph.source.w + 1;
    y = glyph.source.y;

    // Store glyph in map for lookup.
    glyphs_[c] = glyph;
  }

  glPixelStorei(GL_UNPACK_ALIGNMENT, 4);
}

void SpriteFont::PlaceGlyph(FT_Face face, SpriteFontGlyph* glyph, float x, float y)
{
  if (glyph->source.h > maxGlyphHeight_) {
    maxGlyphHeight_ = glyph->source.h;
  }

  if (x + glyph->source.w > texture_->GetWidth()) {
    x = 0;
    y += maxGlyphHeight_;
    maxGlyphHeight_ = glyph->source.h;
  }

  if (y + glyph->source.h > texture_->GetHeight()) {
    throw std::runtime_error("Could not fit all characters on font texture");
  }

  glyph->source.x = x;
  glyph->source.y = y;

  auto bitmap = face->glyph->bitmap;

  // Place glyph bitmap data on texture.
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
        //auto glyph = glyphs_->Get(text.at(i));
        auto glyph = glyphs_[text.at(i)];
        size += glyph.advance.x;
    }
    return size;
}

void SpriteFont::MeasureString(
        const v8::FunctionCallbackInfo<v8::Value> &args) {
    HandleScope scope(args.GetIsolate());
    ScriptHelper helper(args.GetIsolate());

    auto self = GetSelf(args.Holder());
    auto text = helper.GetString(args[0]);
    auto size = self->MeasureString(text);

    args.GetReturnValue().Set(size);
}
