#include <script/scripthelper.h>
#include "texture-collection.h"
#include "graphics-device.h"

using namespace v8;

void TextureCollection::Initialize() {
    ObjectScript::Initialize();
    SetIndexedPropertyHandler(NULL, SetTexture);
}

void TextureCollection::SetTexture(uint32_t index, Local<v8::Value> value,
                                   const PropertyCallbackInfo<Value> &info) {
    HandleScope scope(info.GetIsolate());
    ScriptHelper helper(info.GetIsolate());
    auto self = GetInternalObject(info.Holder());
    auto texture = helper.GetObject<Texture2D>(value);
    self->graphicsDevice_->SetTexture(index, texture);
    info.GetReturnValue().Set(value);
}