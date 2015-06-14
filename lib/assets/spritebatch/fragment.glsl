#version 150 core

in vec2 f_texcoords;
in vec4 f_color;
in float f_text;

out vec4 outColor;

uniform sampler2D tex0;

void main()
{
    if (f_text > 0) {
        outColor = vec4(f_color.rgb, texture(tex0, f_texcoords).r * f_color.a);
    }
    else {
        outColor = texture(tex0, f_texcoords) * f_color;
    }
}