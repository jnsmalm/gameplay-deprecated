#ifndef VERTEXBUFFER_H
#define VERTEXBUFFER_H

#include "v8.h"
#include <gl/glew.h>
#include <script/ObjectScript.h>

class GraphicsDevice;
class VertexDeclaration;

class VertexBuffer : public ObjectScript<VertexBuffer> {

    friend class GraphicsDevice;

public:
    VertexBuffer(v8::Isolate* isolate, GraphicsDevice* graphicsDevice,
                 VertexDeclaration* vertexDeclaration);
    ~VertexBuffer();

    void SetData(float *vertices, int size);
    static void New(const v8::FunctionCallbackInfo<v8::Value>& args);

    VertexDeclaration *getVertexDeclaration() {
        return vertexDeclaration;
    }

private:
    virtual void Initialize() override;
    static void SetData(const v8::FunctionCallbackInfo<v8::Value>& args);

    GLuint glVertexBufferObject_;
    GLuint glVertexArray_;
    GraphicsDevice* graphicsDevice_;
    VertexDeclaration* vertexDeclaration;

};

#endif
