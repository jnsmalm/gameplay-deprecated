#version 150 core

layout(points) in;
layout(triangle_strip, max_vertices = 4) out;

in vec2 g_position[];
in float g_rotation[];
in vec4 g_source[];
in vec2 g_size[];
in vec2 g_origin[];
in vec2 g_scaling[];
in vec4 g_color[];
in float g_text[];

out vec2 f_texcoords;
out vec4 f_color;
out float f_text;

uniform mat4 projection;

void main()
{
    f_color = g_color[0];
    f_text = g_text[0];

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
    float w = x + g_source[0].z;
    float h = y + g_source[0].w;

    float u1 = g_source[0].x/g_size[0].x;
    float v1 = g_source[0].y/g_size[0].y;
    float u2 = g_source[0].z/g_size[0].x + u1;
    float v2 = g_source[0].w/g_size[0].y + v1;

    // Vertex 1 (-1, -1)
    gl_Position = gl_in[0].gl_Position + transform * vec4(x, y, 0, 0);
    f_texcoords = vec2(u1, v1);
    EmitVertex();

    // Vertex 2 (-1, 1)
    gl_Position = gl_in[0].gl_Position + transform * vec4(x, h, 0, 0);
    f_texcoords = vec2(u1, v2);
    EmitVertex();

    // Vertex 3 (1, -1)
    gl_Position = gl_in[0].gl_Position + transform * vec4(w, y, 0, 0);
    f_texcoords = vec2(u2, v1);
    EmitVertex();

    // Vertex 4 (1, 1)
    gl_Position = gl_in[0].gl_Position + transform * vec4(w, h, 0, 0);
    f_texcoords = vec2(u2, v2);
    EmitVertex();

    EndPrimitive();
}

