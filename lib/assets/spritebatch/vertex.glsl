#version 150 core

in vec2 position;
in float rotation;
in vec2 size;
in vec2 origin;
in vec2 scaling;
in vec4 color;

out vec2 g_position;
out float g_rotation;
out vec2 g_size;
out vec2 g_origin;
out vec2 g_scaling;
out vec4 g_color;

uniform mat4 projection;

void main()
{
    g_position = position;
    g_rotation = rotation;
    g_size = size;
    g_origin = origin;
    g_scaling = scaling;
    g_color = color;
    gl_Position = projection * vec4(position, 0, 1);
}