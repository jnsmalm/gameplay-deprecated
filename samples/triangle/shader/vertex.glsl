#version 330 core

layout (location = 0) in vec3 position;
layout (location = 1) in vec3 color;

out VS_OUT {
  vec3 color;
} vs_out;

void main() {
  gl_Position = vec4(position, 1.0f);
  vs_out.color = color;
}