#version 150 core

in vec3 f_position;
in vec4 f_color;
in vec2 f_texcoords;

out vec4 outColor;

uniform sampler2D texture0;
uniform int textureEnabled;

void main()
{
    if (textureEnabled != 0) {
        outColor = texture(texture0, f_texcoords) * f_color;
    } else {
        outColor = f_color;
    }
}