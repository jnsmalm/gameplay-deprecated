#include <script/scripthelper.h>
#include "GlyphCollection.h"

using namespace v8;

void GlyphCollection::Initialize() {
    ObjectScript::Initialize();
    SetNamedPropertyHandler(GetGlyph, NULL);
}


void GlyphCollection::GetGlyph(Local<String> name,
                               const PropertyCallbackInfo<Value> &info) {
    HandleScope scope(info.GetIsolate());
    ScriptHelper helper(info.GetIsolate());

    auto self = GetSelf(info.Holder());
    auto str = helper.GetString(name);
    auto glyph = self->Get(str[0]);

    auto offset = Object::New(info.GetIsolate());
    offset->Set(String::NewFromUtf8(info.GetIsolate(), "x"),
                Int32::New(info.GetIsolate(), glyph.offset.x));
    offset->Set(String::NewFromUtf8(info.GetIsolate(), "y"),
                Int32::New(info.GetIsolate(), glyph.offset.y));

    auto advance = Object::New(info.GetIsolate());
    advance->Set(String::NewFromUtf8(info.GetIsolate(), "x"),
                Int32::New(info.GetIsolate(), glyph.advance.x));
    advance->Set(String::NewFromUtf8(info.GetIsolate(), "y"),
                Int32::New(info.GetIsolate(), glyph.advance.y));

    auto source = Object::New(info.GetIsolate());
    source->Set(String::NewFromUtf8(info.GetIsolate(), "x"),
                 Int32::New(info.GetIsolate(), glyph.source.x));
    source->Set(String::NewFromUtf8(info.GetIsolate(), "y"),
                 Int32::New(info.GetIsolate(), glyph.source.y));
    source->Set(String::NewFromUtf8(info.GetIsolate(), "w"),
                Int32::New(info.GetIsolate(), glyph.source.w));
    source->Set(String::NewFromUtf8(info.GetIsolate(), "h"),
                Int32::New(info.GetIsolate(), glyph.source.h));

    auto result = Object::New(info.GetIsolate());
    result->Set(String::NewFromUtf8(info.GetIsolate(), "offset"), offset);
    result->Set(String::NewFromUtf8(info.GetIsolate(), "advance"), advance);
    result->Set(String::NewFromUtf8(info.GetIsolate(), "source"), source);

    info.GetReturnValue().Set(result);
}
