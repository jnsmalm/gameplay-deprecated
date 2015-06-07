#include "VertexDeclaration.h"

void VertexDeclaration::Apply(ShaderProgram *shaderProgram) {
    if (this->shaderProgram == shaderProgram) {
        // Vertex declaration has already been applied
        return;
    }
    int stride = 0;
    for (auto element : elements) {
        stride += element.offset;
    }
    int offset = 0;
    for (auto element : elements) {
        shaderProgram->SetVertexAttribute(element.name, element.size, stride,
                                          (GLvoid *)offset);
        offset += element.offset;
    }
    this->shaderProgram = shaderProgram;
}

void VertexDeclaration::AddVertexElement(std::string name, int size,
                                         int offset) {
    elements.push_back(VertexElement { name, size, offset });
}
