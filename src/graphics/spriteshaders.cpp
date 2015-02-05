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
  in vec4 rect;

  // Out parameters.
  out vec3 vColor;
  out vec3 vRotation;
  out vec2 vSize;
  out vec2 vScaling;
  out vec4 vRect;

  uniform mat4 projection;

  void main()
  {
    // rotation here is origin
    gl_Position = projection * vec4(position, 0.0, 1.0);
    //gl_Position = vec4(position, 0.0, 0.0);

    // Pass through to geometry shader.
    vColor = color;
    vRotation = rotation;
    vSize = size;
    vScaling = scaling;
    vRect = rect;
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
  in vec4 vRect[];

  // Out parameters.
  out vec2 texcoord;
  out vec3 fColor;

  uniform mat4 projection;
  uniform vec2 textureSize;

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
      vec4(cos(vRotation[0].z), sin(vRotation[0].z), 0.0, 0.0),
      vec4(-sin(vRotation[0].z), cos(vRotation[0].z), 0.0, 0.0),
      vec4(0.0, 0.0, 1.0, 0.0),
      vec4(0.0, 0.0, 0.0, 1.0)
    );

    // Create translation matrix.
    mat4 translate = mat4(
      vec4(vRotation[0].x, 0, 0.0, 0.0),
      vec4(0, vRotation[0].y, 0.0, 0.0),
      vec4(0.0, 0.0, vRotation[0].z, 0.0),
      vec4(0.0, 0.0, 0.0, 1.0)
    );

    mat4 transform = projection * scaling * rotation;
    //vec2 halfSize = vSize[0] * 0.5;
    vec2 halfSize = vRect[0].zw * 0.5;

    float u1 = vRect[0].x/vSize[0].x;
    float v1 = vRect[0].y/vSize[0].y;
    float u2 = vRect[0].z/vSize[0].x + u1;
    float v2 = vRect[0].w/vSize[0].y + v1;

    /*float x = vRect[0].x;
    float y = vRect[0].y;*/
    float x = -vRotation[0].x;
    float y = -vRotation[0].y;
    float w = vRect[0].z + x;
    float h = vRect[0].w + y;

    // Vertex 1 (-1, -1)
    gl_Position = gl_in[0].gl_Position + 
      transform * vec4(x, y, 0.0, 0.0);
    texcoord = vec2(u1, v1);
    EmitVertex();

    // Vertex 2 (-1, 1)
    gl_Position = gl_in[0].gl_Position + 
      //transform * vec4(-halfSize.x, halfSize.y, 0.0, 0.0);
      transform * vec4(x, h, 0.0, 0.0);
    texcoord = vec2(u1, v2);
    EmitVertex();

    // Vertex 3 (1, -1)
    gl_Position = gl_in[0].gl_Position + 
      //transform * vec4( halfSize.x,  -halfSize.y, 0.0, 0.0);
      transform * vec4(w, y, 0.0, 0.0);
    texcoord = vec2(u2, v1);
    EmitVertex();

    // Vertex 4 (1, 1)
    gl_Position = gl_in[0].gl_Position + 
      //transform * vec4( halfSize.x, halfSize.y, 0.0, 0.0);
      transform * vec4(w, h, 0.0, 0.0);
    texcoord = vec2(u2, v2);
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
    //outColor = texture(tex0, texcoord) * vec4(fColor,1);
    outColor = vec4(1, 1, 1, texture(tex0, texcoord).r);
  }

);