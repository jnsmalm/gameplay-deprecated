#ifndef VERTEXRENDERER_H
#define VERTEXRENDERER_H

#include "graphics/window.h"

#include <gl/glew.h>
#include <vector>
#include <functional>

enum PrimitiveType {

  Point,

};

template <typename T> 
class VertexRenderer {

public:

  VertexRenderer()
  {
    Window::EnsureCurrentContext();
    glGenVertexArrays(1, &vertexArray_);
    glGenBuffers(1, &vertexBuffer_);
  }

  ~VertexRenderer()
  {
    glDeleteBuffers(1, &vertexBuffer_);
    glDeleteVertexArrays(1, &vertexArray_);
  }

  void SetupVertexAttributes(std::function<void()> setup)
  {
    glBindVertexArray(vertexArray_);
    glBindBuffer(GL_ARRAY_BUFFER, vertexBuffer_);
    setup();
  }

  void Draw(PrimitiveType type, std::vector<T> vertices)
  {
    glBindBuffer(GL_ARRAY_BUFFER, vertexArray_);
    glBufferData(GL_ARRAY_BUFFER, 
      vertices.size() * sizeof(T), &vertices[0], GL_STREAM_DRAW);

    switch (type) {
      case PrimitiveType::Point:
        glDrawArrays(GL_POINTS, 0, vertices.size());
        break;
   }
  }

private:

  GLuint vertexArray_;
  GLuint vertexBuffer_;

};

#endif