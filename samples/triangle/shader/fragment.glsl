#version 330 core

out vec3 color;

in VS_OUT {
  vec3 color;
} fs_in;

void main()
{
  color = fs_in.color;
}