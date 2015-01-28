#include "graphics/spriteshaders.h"

namespace {

  // Macro for creating glsl source.
  #define GLSL(src) "#version 150 core\n" #src

}

const std::string SpriteShaders::vertexShaderSource = GLSL(

  // In parameters.
  in vec2 position;
  in vec3 color;
  in vec3 rotation;
  in vec2 size;
  in vec2 scaling;

  // Out parameters.
  out vec3 vColor;
  out vec3 vRotation;
  out vec2 vSize;
  out vec2 vScaling;

  uniform mat4 projection;

  void main()
  {
    gl_Position = projection * vec4(position, 0.0, 1.0);

    // Pass through to geometry shader.
    vColor = color;
    vRotation = rotation;
    vSize = size;
    vScaling = scaling;
  }

);

const std::string SpriteShaders::geometryShaderSource = GLSL(

  layout(points) in;
  layout(triangle_strip, max_vertices = 4) out;

  // In parameters.
  in vec3 vColor[];
  in vec3 vRotation[];
  in vec2 vSize[];
  in vec2 vScaling[];

  // Out parameters.
  out vec2 texcoord;
  out vec3 fColor;

  uniform mat4 projection;

  void main()
  {
   // Pass through to fragment shader.
    fColor = vColor[0];

    // Create scaling matrix.
    mat4 scaling = mat4(
      vec4(vScaling[0].x, 0.0, 0.0, 0.0),
      vec4(0.0, vScaling[0].y, 0.0, 0.0),
      vec4(0.0, 0.0, 1.0, 0.0),
      vec4(0.0, 0.0, 0.0, 1.0)
    );

    // Create rotation matrix.
    mat4 rotation = mat4(
      vec4(cos(vRotation[0].z), -sin(vRotation[0].z), 0.0, 0.0),
      vec4(sin(vRotation[0].z), cos(vRotation[0].z), 0.0, 0.0),
      vec4(0.0, 0.0, 1.0, 0.0),
      vec4(0.0, 0.0, 0.0, 1.0)
    );

    mat4 transform = projection * scaling * rotation;
    vec2 halfSize = vSize[0] * 0.5;

    // Vertex 1 (-1, -1)
    gl_Position = gl_in[0].gl_Position + 
      transform * vec4(-halfSize.x, -halfSize.y, 0.0, 0.0);
    texcoord = vec2(0.0, 1.0);
    EmitVertex();

    // Vertex 2 (-1, 1)
    gl_Position = gl_in[0].gl_Position + 
      transform * vec4(-halfSize.x, halfSize.y, 0.0, 0.0);
    texcoord = vec2(0.0, 0.0);
    EmitVertex();

    // Vertex 3 (1, -1)
    gl_Position = gl_in[0].gl_Position + 
      transform * vec4( halfSize.x,  -halfSize.y, 0.0, 0.0);
    texcoord = vec2(1.0, 1.0);
    EmitVertex();

    // Vertex 4 (1, 1)
    gl_Position = gl_in[0].gl_Position + 
      transform * vec4( halfSize.x, halfSize.y, 0.0, 0.0);
    texcoord = vec2(1.0, 0.0);
    EmitVertex();

    EndPrimitive();
  }

);

const std::string SpriteShaders::fragmentShaderSource = GLSL(

  // In parameters.
  in vec3 fColor;
  in vec2 texcoord;

  // Out parameters.
  out vec4 outColor;

  uniform sampler2D tex0;

  void main()
  {
    outColor = texture(tex0, texcoord) * vec4(fColor,1);
  }

);