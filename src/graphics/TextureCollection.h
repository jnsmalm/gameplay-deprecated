#ifndef TEXTURECOLLECTION_H
#define TEXTURECOLLECTION_H

#include <script/ObjectScript.h>
#include <array>

class GraphicsDevice;
class Texture2D;

class TextureCollection : public ObjectScript<TextureCollection> {

public:
    TextureCollection(v8::Isolate *isolate, GraphicsDevice *graphicsDevice_)
            : ObjectScript(isolate), graphicsDevice_(graphicsDevice_) { }

    Texture2D * getTexture(int index);
    void setTexture(int index, Texture2D * texture);

    static void New(const v8::FunctionCallbackInfo<v8::Value>& args) {}

private:
    void Initialize() override;

    static void GetTexture(uint32_t index,
                           const v8::PropertyCallbackInfo<v8::Value> &info);
    static void SetTexture(uint32_t index, v8::Local<v8::Value> value,
                           const v8::PropertyCallbackInfo<v8::Value> &info);

    GraphicsDevice* graphicsDevice_;
    std::array<Texture2D *, 4> textures_;
};

#endif
