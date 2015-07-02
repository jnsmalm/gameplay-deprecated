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

#ifndef JSPLAY_GRAPHICSDEVICE_H
#define JSPLAY_GRAPHICSDEVICE_H

#include <script/script-object-wrap.h>
#include "vertex-buffer.h"
#include "texture2d.h"
#include "shader-program.h"
#include "texture-collection.h"

enum class PrimitiveType {
    TriangleList,
    LineList,
    PointList
};

class Window;

class GraphicsDevice : public ScriptObjectWrap<GraphicsDevice> {

public:
    GraphicsDevice(v8::Isolate* isolate, Window *window_);

    void Clear(float r, float g, float b, float a);
    void DrawPrimitives(PrimitiveType primitiveType, int startVertex,
                        int primitiveCount);
    void Present();
    void SetShaderProgram(ShaderProgram *shaderProgram);
    void SetSynchronizeWithVerticalRetrace(bool value);
    void SetTexture(int index, Texture2D* texture);
    void SetVertexBuffer(VertexBuffer *vertexBuffer);

    ShaderProgram* shaderProgram() {
        return shaderProgram_;
    }

    VertexBuffer* vertexBuffer() {
        return vertexBuffer_;
    }

    TextureCollection* textures() {
        return &textures_;
    }

    Window* window() {
        return window_;
    }

private:
    void Initialize() override;
    static void Clear(const v8::FunctionCallbackInfo<v8::Value>& args);
    static void DrawPrimitives(const v8::FunctionCallbackInfo<v8::Value>& args);
    static void Present(const v8::FunctionCallbackInfo<v8::Value>& args);
    static void SetShaderProgram(
            const v8::FunctionCallbackInfo<v8::Value>& args);
    static void SetSynchronizeWithVerticalRetrace(
            const v8::FunctionCallbackInfo<v8::Value>& args);
    static void SetVertexBuffer(
            const v8::FunctionCallbackInfo<v8::Value>& args);

    TextureCollection textures_;
    VertexBuffer* vertexBuffer_ = nullptr;
    ShaderProgram* shaderProgram_ = nullptr;
    Window* window_ = nullptr;
};

#endif // JSPLAY_GRAPHICSDEVICE_H
