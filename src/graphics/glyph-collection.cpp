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

#include <script/scripthelper.h>
#include <script/scriptobjecthelper.h>
#include "sprite-font.h"
#include "glyph-collection.h"

using namespace v8;

namespace
{
void GetGlyphWithSymbol(Local<String> name,
                        const PropertyCallbackInfo<Value> &info) {

    HandleScope scope(info.GetIsolate());
    ScriptHelper helper(info.GetIsolate());

    auto self = helper.GetObject<GlyphCollection>(info.Holder());
    auto str = helper.GetString(name);
    auto glyph = (*self)[str[0]];

    ScriptObjectHelper offset(info.GetIsolate());
    offset.SetInteger("x", glyph.offset.x);
    offset.SetInteger("y", glyph.offset.y);

    ScriptObjectHelper advance(info.GetIsolate());
    advance.SetInteger("x", glyph.advance.x);
    advance.SetInteger("y", glyph.advance.y);

    ScriptObjectHelper source(info.GetIsolate());
    source.SetInteger("x", glyph.source.x);
    source.SetInteger("y", glyph.source.y);
    source.SetInteger("w", glyph.source.w);
    source.SetInteger("h", glyph.source.h);

    ScriptObjectHelper result(info.GetIsolate());
    result.SetObject("offset", &offset);
    result.SetObject("advance", &advance);
    result.SetObject("source", &source);

    info.GetReturnValue().Set(result.v8_object());
}

void GetGlyphWithDigit(uint32_t index,
                   const v8::PropertyCallbackInfo<v8::Value> &info) {
    HandleScope scope(info.GetIsolate());
    ScriptHelper helper(info.GetIsolate());
    auto name = String::NewFromUtf8(
            info.GetIsolate(), std::to_string(index).c_str());
    GetGlyphWithSymbol(name, info);
}
}

void GlyphCollection::Initialize() {
    ScriptObjectWrap::Initialize();
    SetNamedPropertyHandler(GetGlyphWithSymbol, NULL);
    SetIndexedPropertyHandler(GetGlyphWithDigit, NULL);
}
