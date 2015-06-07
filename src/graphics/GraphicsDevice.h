#ifndef GRAPHICSDEVICE_H
#define GRAPHICSDEVICE_H

#include "window.h"
#include "VertexBuffer.h"
#include "texture.h"
#include "shaderprogram.h"
#include "TextureCollection.h"

class GraphicsDevice : public ObjectScript<GraphicsDevice> {

public:
    GraphicsDevice(v8::Isolate* isolate, Window *window_);
    ~GraphicsDevice();

    void Clear(float r, float g, float b, float a);
    void DrawPrimitives(VertexBuffer* vertexBuffer,
                        ShaderProgram* shaderProgram, PrimitiveT primitiveType,
                        int startVertex, int primitiveCount);
    void Present();
    void SetShaderProgram(ShaderProgram *shaderProgram);
    void SetSynchronizeWithVerticalRetrace(bool value);
    void SetTexture(Texture *texture, int unit);
    void SetVertexBuffer(VertexBuffer *vertexBuffer);
    static void New(const v8::FunctionCallbackInfo<v8::Value>& args) {}

    ShaderProgram* GetShaderProgram() {
        return shaderProgram_;
    }

    VertexBuffer* GetVertexBuffer() {
        return vertexBuffer_;
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

    TextureCollection* textures_ = nullptr;
    VertexBuffer* vertexBuffer_ = nullptr;
    ShaderProgram* shaderProgram_ = nullptr;
    Window* window_ = nullptr;
};

#endif
