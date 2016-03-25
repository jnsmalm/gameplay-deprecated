#version 330 core

in vec2 fragTextureCoords;
in vec4 fragColor;

out vec4 outColor;

uniform sampler2D tex0;
uniform int drawAsText = 0;

void main()
{
    if (drawAsText == 1)
    {
        outColor = vec4(fragColor.rgb,
            texture(tex0, fragTextureCoords).r * fragColor.a);
    }
    else
    {
        outColor = texture(tex0, fragTextureCoords) * fragColor;
    }
}