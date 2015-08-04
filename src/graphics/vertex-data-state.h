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

#ifndef GAMEPLAY_VERTEXDATASTATE_H
#define GAMEPLAY_VERTEXDATASTATE_H

#include <gl/glew.h>
#include <script/script-object-wrap.h>
#include "vertex-declaration.h"
#include <assert.h>

enum class BufferUsage {
    Static,
    Dynamic,
};

class VertexDataState : public ScriptObjectWrap<VertexDataState> {

public:
    VertexDataState(v8::Isolate *isolate, GraphicsDevice* graphicsDevice);
    ~VertexDataState();

    void SetVertices(float *vertices, size_t size, BufferUsage usage);
    void SetElements(int *indices, size_t size, BufferUsage usage);
    void SetVertexDeclaration(VertexDeclaration *declaration,
                              ShaderProgram *program);

    static void New(const v8::FunctionCallbackInfo<v8::Value>& args);

    GLuint glVertexArray() {
        return glVertexArray_;
    }

protected:
    virtual void Initialize() override;

private:
    GraphicsDevice* graphicsDevice_;
    GLuint glVertexArray_;
    GLuint glVertexBuffer_;
    GLuint glElementBuffer_;
};


#endif //GAMEPLAY_VERTEXDATASTATE_H
