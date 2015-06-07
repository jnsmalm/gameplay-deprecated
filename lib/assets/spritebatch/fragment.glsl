#version 150 core

in vec2 f_texcoords;
in vec4 f_color;

out vec4 outColor;

uniform sampler2D tex0;

void main()
{
    //outColor = vec4(1, 1, 1, 1);
    //outColor = vec4(texture(tex0, f_texcoords).rgb, 1);
    outColor = texture(tex0, f_texcoords) * f_color;
}