#ifndef TEXTURECOLLECTION_H
#define TEXTURECOLLECTION_H

#include <script/ObjectScript.h>
#include <array>

class GraphicsDevice;
class Texture;

class TextureCollection : public ObjectScript<TextureCollection> {

public:
    TextureCollection(v8::Isolate *isolate, GraphicsDevice *graphicsDevice_)
            : ObjectScript(isolate), graphicsDevice_(graphicsDevice_) { }

    Texture* getTexture(int index);
    void setTexture(int index, Texture* texture);

    static void New(const v8::FunctionCallbackInfo<v8::Value>& args) {}

private:
    void Initialize() override;

    static void GetTexture(uint32_t index,
                           const v8::PropertyCallbackInfo<v8::Value> &info);
    static void SetTexture(uint32_t index, v8::Local<v8::Value> value,
                           const v8::PropertyCallbackInfo<v8::Value> &info);

    GraphicsDevice* graphicsDevice_;
    std::array<Texture*, 4> textures_;
};

#endif
