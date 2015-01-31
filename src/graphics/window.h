#ifndef WINDOW_H
#define WINDOW_H

#include <gl/glew.h>
#include <glfw/glfw3.h>
#include "v8.h"

class Window {

  friend class Keyboard;

public:

  Window(int width, int height, bool fullscreen);
  ~Window();

  // Gets the time since the window was created.
  double GetTime();
  // Gets a value indicating if the window is closing.
  bool IsClosing();
  // Closes the window.
  void Close();
  // Processes events of the application.
  void PollEvents();
  // Swaps the front and back buffers.
  void SwapBuffers();
  // Clears the back buffer.
  void Clear();

  // Ensures that a OpenGL context exists, throws exception otherwise.
  static void EnsureCurrentContext();
  // Creates a new script instance.
  static void New(const v8::FunctionCallbackInfo<v8::Value>& args);

private:

  GLFWwindow* glfwWindow_;

};


#endif