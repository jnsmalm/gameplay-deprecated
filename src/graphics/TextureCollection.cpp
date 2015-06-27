#include <script/scripthelper.h>
#include "TextureCollection.h"
#include "texture2d.h"
#include "graphics-device.h"

using namespace v8;

Texture2D * TextureCollection::getTexture(int index) {
    return textures_[index];
}

void TextureCollection::setTexture(int index, Texture2D * texture) {
    textures_[index] = texture;
    //graphicsDevice_->SetTexture(texture, index);
    switch (index) {
        case 0:
            glActiveTexture(GL_TEXTURE0);
            break;
        case 1:
            glActiveTexture(GL_TEXTURE1);
            break;
        case 2:
            glActiveTexture(GL_TEXTURE2);
            break;
        case 3:
            glActiveTexture(GL_TEXTURE3);
            break;
        default:
            throw std::runtime_error("Unknown texture unit");
    }
    glBindTexture(GL_TEXTURE_2D, texture->glTexture());
}

void TextureCollection::Initialize() {
    ObjectScript::Initialize();
    SetIndexedPropertyHandler(NULL, SetTexture);
}

void TextureCollection::GetTexture(uint32_t index,
                                   const PropertyCallbackInfo<Value> &info) {
    /*HandleScope scope(info.GetIsolate());
    auto self = GetSelf(info.Holder());
    self->getTexture(index);*/
}

void TextureCollection::SetTexture(uint32_t index, Local<v8::Value> value,
                                   const PropertyCallbackInfo<Value> &info) {
    HandleScope scope(info.GetIsolate());
    ScriptHelper helper(info.GetIsolate());

    auto self = GetSelf(info.Holder());
    auto texture = helper.GetObject<Texture2D>(value);
    self->setTexture(index, texture);

    info.GetReturnValue().Set(value);
}