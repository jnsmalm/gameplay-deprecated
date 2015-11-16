#version 150 core

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;
uniform vec2 tiling = vec2(1, 1);
uniform vec2 offset = vec2(0, 0);

in vec3 vert;
in vec2 vertTexCoord;
in vec3 vertNormal;

out vec2 fragTextureCoords;
out vec3 fragNormal;

void main() {
    fragNormal = vertNormal;
    fragTextureCoords = vertTexCoord.xy * tiling.xy + offset.xy;
    gl_Position = projection * view * model * vec4(vert, 1);
}