#include <script/scripthelper.h>
#include "TextureCollection.h"
#include "texture.h"
#include "GraphicsDevice.h"

using namespace v8;

Texture* TextureCollection::getTexture(int index) {
    return textures_[index];
}

void TextureCollection::setTexture(int index, Texture* texture) {
    textures_[index] = texture;
    graphicsDevice_->SetTexture(texture, index);
}

void TextureCollection::Initialize() {
    ObjectScript::Initialize();
    SetIndexedPropertyHandler(GetTexture, SetTexture);
}

void TextureCollection::GetTexture(uint32_t index,
                                   const PropertyCallbackInfo<Value> &info) {
    HandleScope scope(info.GetIsolate());
    auto self = ObjectScript<TextureCollection>::GetSelf(info.Holder());
    self->getTexture(index);
}

void TextureCollection::SetTexture(uint32_t index, Local<v8::Value> value,
                                   const PropertyCallbackInfo<Value> &info) {
    HandleScope scope(info.GetIsolate());
    ScriptHelper helper(info.GetIsolate());
    auto self = ObjectScript<TextureCollection>::GetSelf(info.Holder());
    auto texture = helper.GetObject<Texture>(value);
    self->setTexture(index, texture);
}