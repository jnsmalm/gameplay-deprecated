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

#include "render-target.h"
#include "script/scripthelper.h"
#include <script/script-engine.h>

using namespace v8;

RenderTarget::RenderTarget(Isolate* isolate, std::vector<Texture2D*> textures) :
        ScriptObjectWrap(isolate) {

    if (textures.size() == 0) {
        throw std::runtime_error(
                "RenderTarget: Must be created with at least one texture.");
    }
    if (textures.size() > 4) {
        throw std::runtime_error(
                "RenderTarget: Can't be created with more than 4 textures.");
    }

    GLint currentFrameBuffer;
    glGetIntegerv(GL_FRAMEBUFFER_BINDING, &currentFrameBuffer);

    glGenFramebuffers(1, &glFramebuffer_);
    glBindFramebuffer(GL_FRAMEBUFFER, glFramebuffer_);

    glGenRenderbuffers(1, &glDepthRenderBuffer_);
    glBindRenderbuffer(GL_RENDERBUFFER, glDepthRenderBuffer_);
    glRenderbufferStorage(GL_RENDERBUFFER, GL_DEPTH_COMPONENT,
                          textures[0]->width(), textures[0]->height());
    glFramebufferRenderbuffer(
            GL_FRAMEBUFFER, GL_DEPTH_ATTACHMENT, GL_RENDERBUFFER,
            glDepthRenderBuffer_);

    std::vector<GLenum> attachments;
    for (int i=0; i<textures.size(); i++) {
        GLenum attachment = GL_COLOR_ATTACHMENT0;
        switch (i) {
            case 1:
                attachment = GL_COLOR_ATTACHMENT1;
                break;
            case 2:
                attachment = GL_COLOR_ATTACHMENT2;
                break;
            case 3:
                attachment = GL_COLOR_ATTACHMENT3;
                break;
            default:
                // This should never happen because the number of textures is
                // restricted to max 4.
                break;
        }
        attachments.push_back(attachment);
        glFramebufferTexture2D(GL_FRAMEBUFFER, attachment, GL_TEXTURE_2D,
                               textures[i]->glTexture(), 0);
    }

    GLenum drawBuffers[textures.size()];
    std::copy(attachments.begin(), attachments.end(), drawBuffers);
    glDrawBuffers(static_cast<GLsizei>(textures.size()), drawBuffers);

    if (glCheckFramebufferStatus(GL_FRAMEBUFFER) != GL_FRAMEBUFFER_COMPLETE) {
        throw std::runtime_error(
                "RenderTarget: Failed to create frame buffer.");
    }

    glBindFramebuffer(GL_FRAMEBUFFER, static_cast<GLuint>(currentFrameBuffer));
}

RenderTarget::~RenderTarget() {
    glDeleteRenderbuffers(1, &glDepthRenderBuffer_);
    glDeleteFramebuffers(1, &glFramebuffer_);
}

void RenderTarget::Initialize() {
    ScriptObjectWrap::Initialize();
}

void RenderTarget::New(const FunctionCallbackInfo<Value>& args) {
    HandleScope scope(args.GetIsolate());
    ScriptHelper helper(args.GetIsolate());
    std::vector<Texture2D*> textures;
    for (int i=0; i<args.Length(); i++) {
        textures.push_back(helper.GetObject<Texture2D>(args[i]));
    }
    try {
        auto renderTarget = new RenderTarget(args.GetIsolate(), textures);
        args.GetReturnValue().Set(renderTarget->v8Object());
    }
    catch (std::exception& ex) {
        ScriptEngine::current().ThrowTypeError(ex.what());
    }
}