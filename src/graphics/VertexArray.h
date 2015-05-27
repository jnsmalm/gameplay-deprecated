#ifndef VERTEXARRAY_H
#define VERTEXARRAY_H

#include <GL/glew.h>

class VertexArray {

    friend class GraphicsDevice;

    // Class that is only available to vertex array.
    class ScriptVertexArray;

public:

    VertexArray();
    ~VertexArray();

    void Bind();

    static void InstallScript(
            v8::Isolate* isolate, v8::Handle<v8::ObjectTemplate> global);

private:

    GLuint glVertexArray_;

};

#endif
