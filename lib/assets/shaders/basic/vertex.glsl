#version 150 core

in vec3 position;
in vec4 color;
in vec2 texcoords;

out vec3 f_position;
out vec4 f_color;
out vec2 f_texcoords;

uniform mat4 world;
uniform mat4 view;
uniform mat4 projection;

void main()
{
    f_texcoords = texcoords;
    f_color = color;
    gl_Position = projection * view * world * vec4(position, 1);
}