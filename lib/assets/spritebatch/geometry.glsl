#version 150 core

layout(points) in;
layout(triangle_strip, max_vertices = 4) out;

in vec2 g_position[];
in float g_rotation[];
in vec2 g_size[];
in vec2 g_origin[];
in vec2 g_scaling[];
in vec4 g_color[];

out vec2 f_texcoords;
out vec4 f_color;

uniform mat4 projection;

void main()
{
    f_color = g_color[0];

    mat4 scaling = mat4(
        vec4(g_scaling[0].x, 0.0, 0.0, 0.0),
        vec4(0.0, g_scaling[0].y, 0.0, 0.0),
        vec4(0.0, 0.0, 1.0, 0.0),
        vec4(0.0, 0.0, 0.0, 1.0)
    );

    mat4 rotation = mat4(
        vec4(cos(g_rotation[0]), sin(g_rotation[0]), 0.0, 0.0),
        vec4(-sin(g_rotation[0]), cos(g_rotation[0]), 0.0, 0.0),
        vec4(0.0, 0.0, 1.0, 0.0),
        vec4(0.0, 0.0, 0.0, 1.0)
    );

    mat4 transform = projection * rotation * scaling;

    float x = -g_origin[0].x;
    float y = -g_origin[0].y;
    float w = x + g_size[0].x;
    float h = y + g_size[0].y;

    // Vertex 1 (-1, -1)
    gl_Position = gl_in[0].gl_Position + transform * vec4(x, y, 0, 0);
    f_texcoords = vec2(0, 0);
    EmitVertex();

    // Vertex 2 (-1, 1)
    gl_Position = gl_in[0].gl_Position + transform * vec4(x, h, 0, 0);
    f_texcoords = vec2(0, 1);
    EmitVertex();

    // Vertex 3 (1, -1)
    gl_Position = gl_in[0].gl_Position + transform * vec4(w, y, 0, 0);
    f_texcoords = vec2(1, 0);
    EmitVertex();

    // Vertex 4 (1, 1)
    gl_Position = gl_in[0].gl_Position + transform * vec4(w, h, 0, 0);
    f_texcoords = vec2(1, 1);
    EmitVertex();

    EndPrimitive();
}

