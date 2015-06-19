cmake_minimum_required(VERSION 3.2.2)

set (PROJECT_NAME "jsplay")
project(${PROJECT_NAME})

# Set the source directory root
set (PROJECT_SRC_DIR ${CMAKE_SOURCE_DIR}/src)

add_subdirectory(deps/glfw)
include_directories(deps/glfw/include)

add_subdirectory(deps/glew)
include_directories(deps/glew/include)

add_subdirectory(deps/freetype)
include_directories(deps/freetype/include)

add_subdirectory(deps/openal)
include_directories(deps/openal/include)

# Set the dependency directories used
set (V8_INCLUDE_DIR ${CMAKE_SOURCE_DIR}/deps/v8/include)
set (V8_LIBRARIES_DIR ${CMAKE_SOURCE_DIR}/deps/v8/out/native)

# Set the sources to compile
set (PROJECT_SRC_FILES
  ${PROJECT_SRC_DIR}/main
  ${PROJECT_SRC_DIR}/script/scriptengine
  ${PROJECT_SRC_DIR}/system/console
  ${PROJECT_SRC_DIR}/system/file
  ${PROJECT_SRC_DIR}/input/keyboard
  ${PROJECT_SRC_DIR}/input/mouse
  ${PROJECT_SRC_DIR}/graphics/texture
  ${PROJECT_SRC_DIR}/graphics/spritefont
  ${PROJECT_SRC_DIR}/graphics/shader
  ${PROJECT_SRC_DIR}/graphics/shaderprogram
  ${PROJECT_SRC_DIR}/graphics/window)

# Set the v8 libraries
set (V8_LIBRARIES
  ${V8_LIBRARIES_DIR}/libv8_base.a
  ${V8_LIBRARIES_DIR}/libv8_libbase.a
  ${V8_LIBRARIES_DIR}/libv8_snapshot.a
  ${V8_LIBRARIES_DIR}/libv8_libplatform.a
  ${V8_LIBRARIES_DIR}/libicudata.a
  ${V8_LIBRARIES_DIR}/libicuuc.a
  ${V8_LIBRARIES_DIR}/libicui18n.a)

set (PROJECT_LIBRARIES
  ${V8_LIBRARIES}
  freetype
  libglew_static
  openal
  glfw ${GLFW_LIBRARIES})

# Set the libraries for Apple OS X
if(${CMAKE_SYSTEM_NAME} MATCHES "Darwin")

  find_library(COCOA_LIBRARY Cocoa)
  find_library(OPENGL_LIBRARY OpenGL)
  find_library(IOKIT_LIBRARY IOKit)
  find_library(COREVIDEO_LIBRARY CoreVideo)

  set (PROJECT_LIBRARIES
    ${PROJECT_LIBRARIES}
    ${COCOA_LIBRARY}
    ${OPENGL_LIBRARY}
    ${IOKIT_LIBRARY}
    ${COREVIDEO_LIBRARY})

endif()

add_definitions(-std=c++11 -stdlib=libc++)
include_directories(${GLM_INCLUDE_DIR} ${V8_INCLUDE_DIR} ${PROJECT_SRC_DIR} deps/v8 deps/lodepng)
add_executable(${PROJECT_NAME} ${PROJECT_SRC_FILES} src/graphics/VertexBuffer.cpp src/graphics/VertexBuffer.h src/graphics/GraphicsDevice.cpp src/graphics/GraphicsDevice.h src/graphics/VertexDeclaration.cpp src/graphics/VertexDeclaration.h src/graphics/TextureCollection.cpp src/graphics/TextureCollection.h src/script/ObjectScript.h deps/lodepng/lodepng src/graphics/glyph-collection.h src/graphics/glyph-collection.cpp src/audio/audio-manager.cpp src/audio/audio-manager.h src/audio/sound-buffer.cpp src/audio/sound-buffer.h src/audio/wave-format.cpp src/audio/wave-format.h src/audio/sound-source.cpp src/audio/sound-source.h src/script/scriptobjecthelper.h)
target_link_libraries(${PROJECT_NAME} ${PROJECT_LIBRARIES})
#set(CMAKE_BUILD_TYPE Release)