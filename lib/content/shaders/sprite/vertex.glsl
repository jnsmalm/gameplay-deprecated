#version 330 core

layout (location = 0) in vec3 position;
layout (location = 1) in vec2 textureCoords;
layout (location = 2) in vec4 color;

out vec2 fragTextureCoords;
out vec4 fragColor;

uniform mat4 viewProjection;

void main() {
    fragTextureCoords = textureCoords;
    fragColor = color;
    gl_Position = viewProjection * vec4(position, 1);
}