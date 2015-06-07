#ifndef VERTEXDECLARATION_H
#define VERTEXDECLARATION_H

#include <string>
#include <vector>
#include "shaderprogram.h"

class VertexDeclaration {

    struct VertexElement {
        std::string name;
        int size;
        int offset;
    };

public:
    VertexDeclaration() { }

    void AddVertexElement(std::string name, int size, int offset);
    void Apply(ShaderProgram* shaderProgram);

private:
    std::vector<VertexElement> elements;
    ShaderProgram* shaderProgram;
};

#endif
