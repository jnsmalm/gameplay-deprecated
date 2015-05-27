#ifndef GRAPHICSDEVICE_H
#define GRAPHICSDEVICE_H

#include "window.h"
#include "VertexBuffer.h"
#include "VertexArray.h"
#include "texture.h"
#include "shaderprogram.h"

class GraphicsDevice {

    // Class that is only available to graphics device.
    class ScriptGraphicsDevice;

public:

    GraphicsDevice(Window *window_) : window_(window_) { }
    ~GraphicsDevice() { }

    void Clear(float r, float g, float b, float a);
    void DrawPrimitives(PrimitiveT primitiveType, int startVertex,
                        int primitiveCount);
    void Present();
    void SetShaderProgram(ShaderProgram *shaderProgram);
    void SetSynchronizeWithVerticalRetrace(bool value);
    void SetTexture(Texture *texture, int unit);
    void SetVertexArray(VertexArray *vertexArray);
    void SetVertexBuffer(VertexBuffer *vertexBuffer);

    void InstallScript(v8::Isolate* isolate, v8::Handle<v8::Object> parent);

private:

    Window *window_;

};

#endif
