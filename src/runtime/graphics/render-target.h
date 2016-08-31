/*The MIT License (MIT)

Copyright (c) 2016 Jens Malmborg

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

#ifndef GAMEPLAY_RENDERTARGET_H
#define GAMEPLAY_RENDERTARGET_H

#include <gl/glew.h>
#include "v8.h"
#include <script/script-object-wrap.h>
#include "texture2d.h"
#include <vector>

class RenderTarget : public ScriptObjectWrap<RenderTarget> {

public:
    RenderTarget(v8::Isolate* isolate, std::vector<Texture2D*> textures);
    ~RenderTarget();

    static void New(const v8::FunctionCallbackInfo<v8::Value>& args);

    GLuint framebuffer() {
        return glFramebuffer_;
    }

protected:
    virtual void Initialize() override;

private:
    GLuint glFramebuffer_;
    GLuint glDepthRenderBuffer_;
};

#endif // GAMEPLAY_RENDERTARGET_H