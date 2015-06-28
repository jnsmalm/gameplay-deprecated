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

#ifndef JSPLAY_TEXTURECOLLECTION_H
#define JSPLAY_TEXTURECOLLECTION_H

#include <script/ObjectScript.h>
#include <array>

class GraphicsDevice;
class Texture2D;

class TextureCollection : public ObjectScript<TextureCollection> {

public:
    TextureCollection(v8::Isolate *isolate, GraphicsDevice *graphicsDevice_)
            : ObjectScript(isolate), graphicsDevice_(graphicsDevice_) { }

    Texture2D*& operator[](const int index) {
        return textures_[index];
    }

protected:
    void Initialize() override;

private:
    static void SetTexture(
            uint32_t index, v8::Local<v8::Value> value,
            const v8::PropertyCallbackInfo<v8::Value> &info);

    GraphicsDevice* graphicsDevice_;
    std::array<Texture2D*, 4> textures_;
};

#endif // JSPLAY_TEXTURECOLLECTION_H
