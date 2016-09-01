#version 330 core

in vec2 fragTextureCoords;
in vec4 fragColor;

out vec4 outColor;

uniform sampler2D tex0;

void main()
{
    outColor = texture(tex0, fragTextureCoords) * fragColor;
}