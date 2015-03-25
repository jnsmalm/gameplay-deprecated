cmake_minimum_required(VERSION 2.6)

set (PROJECT_NAME "ko")
project(${PROJECT_NAME})

# Set the source directory root
set (PROJECT_SRC_DIR ${CMAKE_SOURCE_DIR}/src)

# Set the dependency directories used
set (V8_INCLUDE_DIR ${CMAKE_SOURCE_DIR}/deps/v8/include)
set (V8_LIBRARIES_DIR ${CMAKE_SOURCE_DIR}/deps/v8/out/native)
set (GLM_INCLUDE_DIR ${CMAKE_SOURCE_DIR}/deps/glm)
set (FREEIMAGE_LIBRARIES_DIR ${CMAKE_SOURCE_DIR}/deps/freeimage/dist)
set (FREETYPE_INCLUDE_DIR ${CMAKE_SOURCE_DIR}/deps/freetype2/include)
set (FREETYPE_LIBRARIES_DIR ${CMAKE_SOURCE_DIR}/deps/freetype2/build)

# Set the sources to compile
set (PROJECT_SRC_FILES
  ${PROJECT_SRC_DIR}/main
  ${PROJECT_SRC_DIR}/script/scriptengine
  ${PROJECT_SRC_DIR}/system/file
  ${PROJECT_SRC_DIR}/input/keyboard
  ${PROJECT_SRC_DIR}/input/mouse
  ${PROJECT_SRC_DIR}/graphics/texture
  ${PROJECT_SRC_DIR}/graphics/spritebatch
  ${PROJECT_SRC_DIR}/graphics/spriteshaders
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

# Set the freeimage libraries
set (FREEIMAGE_LIBRARIES
  ${FREEIMAGE_LIBRARIES_DIR}/libfreeimage.a)

# Set the freetype libraries
set (FREETYPE_LIBRARIES
  ${FREETYPE_LIBRARIES_DIR}/libfreetype.a)

find_package(GLEW REQUIRED)
find_package(GLFW REQUIRED)

set (PROJECT_LIBRARIES
  ${V8_LIBRARIES}
  ${FREEIMAGE_LIBRARIES}
  ${FREETYPE_LIBRARIES}
  ${GLEW_LIBRARIES}
  glfw3 ${GLFW_LIBRARIES})

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
include_directories(${GLM_INCLUDE_DIR} ${V8_INCLUDE_DIR} ${PROJECT_SRC_DIR} ${FREETYPE_INCLUDE_DIR})
add_executable(${PROJECT_NAME} ${PROJECT_SRC_FILES})
target_link_libraries(${PROJECT_NAME} ${PROJECT_LIBRARIES})