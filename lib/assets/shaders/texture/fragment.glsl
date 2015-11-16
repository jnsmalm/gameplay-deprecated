#version 150 core

in vec2 fragTextureCoords;

out vec4 outColor;

uniform sampler2D tex0;

void main()
{
    outColor = texture(tex0, fragTextureCoords);
}