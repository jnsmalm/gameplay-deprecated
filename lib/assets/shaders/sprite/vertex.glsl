#version 150 core

in vec3 position;
in vec2 textureCoords;
in vec4 color;

out vec2 fragTextureCoords;
out vec4 fragColor;

uniform mat4 projection;

void main() {
    fragTextureCoords = textureCoords;
    fragColor = color;
    gl_Position = projection * vec4(position, 1);
}