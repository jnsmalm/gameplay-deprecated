cmake_minimum_required(VERSION 3.2.2)

project(play)

set (GAMEPLAY_VERSION "0.6.0")

set (WIN32_V8_LIBS_DIR
  ${CMAKE_SOURCE_DIR}/deps/v8/build/Release/lib)
set (V8_LIBS_DIR
  ${CMAKE_SOURCE_DIR}/deps/v8/out/native)
set(CMAKE_BUILD_TYPE Debug)

if (WIN32)
  set (V8_LIBS
    ${WIN32_V8_LIBS_DIR}/v8_base_0.lib
    ${WIN32_V8_LIBS_DIR}/v8_base_1.lib
    ${WIN32_V8_LIBS_DIR}/v8_base_2.lib
    ${WIN32_V8_LIBS_DIR}/v8_base_3.lib
    ${WIN32_V8_LIBS_DIR}/v8_libbase.lib
    ${WIN32_V8_LIBS_DIR}/v8_nosnapshot.lib
    ${WIN32_V8_LIBS_DIR}/v8_libplatform.lib
    ${WIN32_V8_LIBS_DIR}/icuuc.lib
    ${WIN32_V8_LIBS_DIR}/icui18n.lib)
  set (OPENAL_LIBS OpenAL32)
else()
  set (V8_LIBS
    ${V8_LIBS_DIR}/libv8_base.a
    ${V8_LIBS_DIR}/libv8_libbase.a
    ${V8_LIBS_DIR}/libv8_nosnapshot.a
    ${V8_LIBS_DIR}/libv8_libplatform.a
    ${V8_LIBS_DIR}/libicudata.a
    ${V8_LIBS_DIR}/libicuuc.a
    ${V8_LIBS_DIR}/libicui18n.a)
  set (OPENAL_LIBS openal)
endif()

set (JSPLAY_SRCS
        src/runtime/main
        src/runtime/utils/console
        src/runtime/utils/file-reader
        src/runtime/utils/timer.cpp
        src/runtime/utils/timer.h
        src/runtime/utils/path-helper.h
        src/runtime/script/script-global.h
        src/runtime/script/script-global.cpp
        src/runtime/script/script-engine.h
        src/runtime/script/script-engine.cpp
        src/runtime/script/script-object-wrap.h
        src/runtime/script/scriptobjecthelper.h
        src/runtime/input/keyboard
        src/runtime/input/mouse
        src/runtime/graphics/texture2d.h
        src/runtime/graphics/texture2d.cpp
        src/runtime/graphics/texture-font.h
        src/runtime/graphics/texture-font.cpp
        src/runtime/graphics/render-target.h
        src/runtime/graphics/render-target.cpp
        src/runtime/graphics/shader
        src/runtime/graphics/shader-program.h
        src/runtime/graphics/shader-program.cpp
        src/runtime/graphics/window
        src/runtime/graphics/graphics-device.cpp
        src/runtime/graphics/graphics-device.h
        src/runtime/graphics/vertex-specification.cpp
        src/runtime/graphics/vertex-specification.h
        src/runtime/graphics/texture-collection.cpp
        src/runtime/graphics/texture-collection.h
        src/runtime/graphics/glyph-collection.h
        src/runtime/graphics/glyph-collection.cpp
        src/runtime/audio/audio-manager.cpp
        src/runtime/audio/audio-manager.h
        src/runtime/audio/sound-buffer.cpp
        src/runtime/audio/sound-buffer.h
        src/runtime/audio/sound-source.cpp
        src/runtime/audio/sound-source.h
        src/runtime/utils/file-watcher.cpp
        src/runtime/utils/file-watcher.h
        src/runtime/debug/debug-server.cpp
        src/runtime/debug/debug-server.h)

set (JSPLAY_LIBS
  ${V8_LIBS}
  freetype
  libglew_static
  ${OPENAL_LIBS}
  glfw ${GLFW_LIBRARIES}
  efsw)

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

if (MSVC)
  # Set Visual Studio runtime library to /MT instead of /MD for static linking
  set(flags
    CMAKE_C_FLAGS_DEBUG
    CMAKE_C_FLAGS_MINSIZEREL
    CMAKE_C_FLAGS_RELEASE
    CMAKE_C_FLAGS_RELWITHDEBINFO
    CMAKE_CXX_FLAGS_DEBUG
    CMAKE_CXX_FLAGS_MINSIZEREL
    CMAKE_CXX_FLAGS_RELEASE
    CMAKE_CXX_FLAGS_RELWITHDEBINFO)
  foreach(flag_var ${flags})
    if(${flag_var} MATCHES "/MD")
      string(REGEX REPLACE "/MD" "/MT" ${flag_var} "${${flag_var}}")
    endif()
  endforeach()
endif()

set(CMAKE_RUNTIME_OUTPUT_DIRECTORY "${CMAKE_CURRENT_SOURCE_DIR}/bin")

add_subdirectory(deps/glfw)
add_subdirectory(deps/glew)
add_subdirectory(deps/freetype)
add_subdirectory(deps/openal-soft)
add_subdirectory(deps/efsw)

include_directories(
  deps/glfw/include
  deps/glew/include
  deps/freetype/include
  deps/openal-soft/include
  deps/stb
  deps/v8/include
  src/runtime
  deps/v8
  deps/efsw/include
  deps/asio)

add_definitions(
  -DGLEW_STATIC
  -DAL_LIBTYPE_STATIC
  -DGAMEPLAY_VERSION="${GAMEPLAY_VERSION}"
  -DASIO_STANDALONE)

if (UNIX)
  add_definitions(-std=c++11 -stdlib=libc++)
endif()

add_executable(play ${JSPLAY_SRCS})

target_link_libraries(play ${JSPLAY_LIBS})