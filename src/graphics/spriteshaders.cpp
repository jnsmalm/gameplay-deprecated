#include "graphics/spriteshaders.h"

namespace {

  // Macro for creating glsl source.
  #define GLSL(src) "#version 150 core\n" #src

}

const std::string SpriteShaders::vertexShaderSource = GLSL(

  // In parameters.
  in vec2 position;
  in vec2 origin;
  in vec4 color;
  in vec2 scaling;
  in vec2 atlasSize;
  in vec4 atlasSource;
  in float rotation;
  in float text;

  // Out parameters.
  out vec2 vOrigin;
  out vec4 vColor;
  out vec2 vScaling;
  out vec2 vAtlasSize;
  out vec4 vAtlasSource;
  out float vRotation;
  out float vText;

  uniform mat4 projection;

  void main()
  {
    gl_Position = projection * vec4(position, 0.0, 1.0);

    // Pass through to geometry shader.
    vOrigin = origin;
    vColor = color;
    vScaling = scaling;
    vAtlasSize = atlasSize;
    vAtlasSource = atlasSource;
    vRotation = rotation;
    vText = text;
  }

);

const std::string SpriteShaders::geometryShaderSource = GLSL(

  layout(points) in;
  layout(triangle_strip, max_vertices = 4) out;

  // In parameters.
  in vec2 vOrigin[];
  in vec4 vColor[];
  in float vRotation[];
  in vec2 vAtlasSize[];
  in vec2 vScaling[];
  in vec4 vAtlasSource[];
  in float vText[];

  // Out parameters.
  out vec2 texcoord;
  out vec4 fColor;
  out float fText;

  uniform mat4 projection;
  uniform vec2 textureSize;

  void main()
  {
   // Pass through to fragment shader.
    fColor = vColor[0];
    fText = vText[0];

    // Create scaling matrix.
    mat4 scaling = mat4(
      vec4(vScaling[0].x, 0.0, 0.0, 0.0),
      vec4(0.0, vScaling[0].y, 0.0, 0.0),
      vec4(0.0, 0.0, 1.0, 0.0),
      vec4(0.0, 0.0, 0.0, 1.0)
    );

    // Create rotation matrix.
    mat4 rotation = mat4(
      vec4(cos(vRotation[0]), sin(vRotation[0]), 0.0, 0.0),
      vec4(-sin(vRotation[0]), cos(vRotation[0]), 0.0, 0.0),
      vec4(0.0, 0.0, 1.0, 0.0),
      vec4(0.0, 0.0, 0.0, 1.0)
    );

    mat4 transform = projection * scaling * rotation;
    vec2 halfSize = vAtlasSource[0].zw * 0.5;

    float u1 = vAtlasSource[0].x/vAtlasSize[0].x;
    float v1 = vAtlasSource[0].y/vAtlasSize[0].y;
    float u2 = vAtlasSource[0].z/vAtlasSize[0].x + u1;
    float v2 = vAtlasSource[0].w/vAtlasSize[0].y + v1;

    float x = -vOrigin[0].x;
    float y = -vOrigin[0].y;
    float w = vAtlasSource[0].z + x;
    float h = vAtlasSource[0].w + y;

    // Vertex 1 (-1, -1)
    gl_Position = gl_in[0].gl_Position + 
      transform * vec4(x, y, 0.0, 0.0);
    texcoord = vec2(u1, v1);
    EmitVertex();

    // Vertex 2 (-1, 1)
    gl_Position = gl_in[0].gl_Position + 
      transform * vec4(x, h, 0.0, 0.0);
    texcoord = vec2(u1, v2);
    EmitVertex();

    // Vertex 3 (1, -1)
    gl_Position = gl_in[0].gl_Position + 
      transform * vec4(w, y, 0.0, 0.0);
    texcoord = vec2(u2, v1);
    EmitVertex();

    // Vertex 4 (1, 1)
    gl_Position = gl_in[0].gl_Position + 
      transform * vec4(w, h, 0.0, 0.0);
    texcoord = vec2(u2, v2);
    EmitVertex();

    EndPrimitive();
  }

);

const std::string SpriteShaders::fragmentShaderSource = GLSL(

  // In parameters.
  in vec4 fColor;
  in vec2 texcoord;
  in float fText;

  // Out parameters.
  out vec4 outColor;

  uniform sampler2D tex0;

  void main()
  {
    if (fText > 0) {
      outColor = vec4(fColor.rgb, texture(tex0, texcoord).r * fColor.a);
    }
    else {
      outColor = texture(tex0, texcoord) * fColor;
    }
  }

);