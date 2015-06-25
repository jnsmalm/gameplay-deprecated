cmake_minimum_required(VERSION 3.2.2)

project(jsplay)

set (WIN32_V8_LIBS_DIR
  ${CMAKE_SOURCE_DIR}/deps/v8/build/Release/lib)
set (V8_LIBS_DIR
  ${CMAKE_SOURCE_DIR}/deps/v8/out/native)
set(CMAKE_BUILD_TYPE Release)

add_subdirectory(deps/glfw)
add_subdirectory(deps/glew)
add_subdirectory(deps/freetype)
add_subdirectory(deps/openal)

if (WIN32)
  set (V8_LIBS
    ${WIN32_V8_LIBS_DIR}/v8_base_0.lib
    ${WIN32_V8_LIBS_DIR}/v8_base_1.lib
    ${WIN32_V8_LIBS_DIR}/v8_base_2.lib
    ${WIN32_V8_LIBS_DIR}/v8_base_3.lib
    ${WIN32_V8_LIBS_DIR}/v8_libbase.lib
    ${WIN32_V8_LIBS_DIR}/v8_snapshot.lib
    ${WIN32_V8_LIBS_DIR}/v8_libplatform.lib
    ${WIN32_V8_LIBS_DIR}/icuuc.lib
    ${WIN32_V8_LIBS_DIR}/icui18n.lib)
  set (OPENAL_LIBS OpenAL32)
else()
  set (V8_LIBS
    ${V8_LIBS_DIR}/libv8_base.a
    ${V8_LIBS_DIR}/libv8_libbase.a
    ${V8_LIBS_DIR}/libv8_snapshot.a
    ${V8_LIBS_DIR}/libv8_libplatform.a
    ${V8_LIBS_DIR}/libicudata.a
    ${V8_LIBS_DIR}/libicuuc.a
    ${V8_LIBS_DIR}/libicui18n.a)
  set (OPENAL_LIBS openal)
endif()

include_directories(
  deps/glfw/include
  deps/glew/include
  deps/freetype/include
  deps/openal/include
  deps/lodepng
  deps/v8/include
  src
  deps/v8)

set (JSPLAY_SRCS
  src/main
  src/system/console
  src/system/file
  src/script/scriptengine
  src/script/ObjectScript.h
  src/script/scriptobjecthelper.h
  src/input/keyboard
  src/input/mouse
  src/graphics/texture
  src/graphics/spritefont
  src/graphics/shader
  src/graphics/shaderprogram
  src/graphics/window
  src/graphics/VertexBuffer.cpp
  src/graphics/VertexBuffer.h
  src/graphics/graphics-device.cpp
  src/graphics/graphics-device.h
  src/graphics/VertexDeclaration.cpp
  src/graphics/VertexDeclaration.h
  src/graphics/TextureCollection.cpp
  src/graphics/TextureCollection.h
  src/graphics/glyph-collection.h
  src/graphics/glyph-collection.cpp
  src/audio/audio-manager.cpp
  src/audio/audio-manager.h
  src/audio/sound-buffer.cpp
  src/audio/sound-buffer.h
  src/audio/wave-format.cpp
  src/audio/wave-format.h
  src/audio/sound-source.cpp
  src/audio/sound-source.h
  deps/lodepng/lodepng)

set (JSPLAY_LIBS
  ${V8_LIBS}
  freetype
  libglew_static
  ${OPENAL_LIBS}
  glfw ${GLFW_LIBRARIES})

if (${CMAKE_SYSTEM_NAME} MATCHES "Darwin")
  # Find and set libraries for Mac OS X
  find_library(COCOA_LIBRARY Cocoa)
  find_library(OPENGL_LIBRARY OpenGL)
  find_library(IOKIT_LIBRARY IOKit)
  find_library(COREVIDEO_LIBRARY CoreVideo)
  set (JSPLAY_LIBS
    ${JSPLAY_LIBS}
    ${COCOA_LIBRARY}
    ${OPENGL_LIBRARY}
    ${IOKIT_LIBRARY}
    ${COREVIDEO_LIBRARY})
endif()

add_definitions(-DGLEW_STATIC -DAL_LIBTYPE_STATIC)

if (UNIX)
  add_definitions(-std=c++11 -stdlib=libc++)
endif()

add_executable(jsplay ${JSPLAY_SRCS})

target_link_libraries(jsplay ${JSPLAY_LIBS})