/*The MIT License (MIT)

Copyright (c) 2015 Jens Malmborg

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

#ifndef GAMEPLAY_GRAPHICSDEVICE_H
#define GAMEPLAY_GRAPHICSDEVICE_H

#include <script/script-object-wrap.h>
#include "texture-collection.h"

enum class PrimitiveType {
    TriangleList,
    LineList,
    PointList
};

enum class BlendState {
    Additive,
    AlphaBlend,
    Opaque,
};

enum class DepthState {
    Default,
    Read,
    None,
};

enum class StencilState {
    Default,
    Mask,
    Clip,
};

enum class RasterizerState {
    CullNone,
    CullClockwise,
    CullCounterClockwise,
};

class Window;
class VertexDataState;
class ShaderProgram;

class GraphicsDevice : public ScriptObjectWrap<GraphicsDevice> {

public:
    GraphicsDevice(v8::Isolate* isolate, Window *window_);

    void Clear(float r, float g, float b, float a);
    void DrawPrimitives(PrimitiveType primitiveType, int startVertex,
                        int primitiveCount);
    void DrawIndexedPrimitives(PrimitiveType primitiveType, int startVertex,
                               int primitiveCount);
    void Present();
    void SetShaderProgram(ShaderProgram *shaderProgram);
    void SetSynchronizeWithVerticalRetrace(bool value);
    void SetTexture(int index, Texture2D* texture);
    void SetVertexDataState(VertexDataState *vertexDataState);
    void SetBlendState(BlendState state);
    void SetDepthState(DepthState state);
    void SetStencilState(StencilState state);
    void SetRasterizerState(RasterizerState state);

    ShaderProgram* shaderProgram() {
        return shaderProgram_;
    }

    VertexDataState* vertexDataState() {
        return vertexDataState_;
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
    static void DrawPrimitives(const v8::FunctionCallbackInfo<v8::Value> &args);
    static void DrawIndexedPrimitives(
            const v8::FunctionCallbackInfo<v8::Value> &args);
    static void Present(const v8::FunctionCallbackInfo<v8::Value>& args);
    static void SetShaderProgram(
            const v8::FunctionCallbackInfo<v8::Value>& args);
    static void SetSynchronizeWithVerticalRetrace(
            const v8::FunctionCallbackInfo<v8::Value>& args);

    TextureCollection textures_;
    VertexDataState* vertexDataState_ = nullptr;
    ShaderProgram* shaderProgram_ = nullptr;
    Window* window_ = nullptr;
};

#endif // GAMEPLAY_GRAPHICSDEVICE_H
