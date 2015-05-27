#ifndef VERTEXBUFFER_H
#define VERTEXBUFFER_H

#include "v8.h"
#include <GL/glew.h>

class VertexBuffer {

    friend class GraphicsDevice;

    // Class that is only available to vertex buffer.
    class ScriptVertexBuffer;

public:

    VertexBuffer();
    ~VertexBuffer();

    void Bind();
    void SetData(float *vertices, int size);

    static void InstallScript(
        v8::Isolate* isolate, v8::Handle<v8::ObjectTemplate> global);

private:

    GLuint glVertexBufferObject_;

};

#endif
