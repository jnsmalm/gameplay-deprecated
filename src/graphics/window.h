#ifndef WINDOW_H
#define WINDOW_H

#include <gl/glew.h>
#include <glfw/glfw3.h>
#include "v8.h"

class Keyboard;

class Window {

  friend class Keyboard;

  // Class that is only available to window.
  class ScriptWindow;
  

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
  void Clear(float r, float g, float b, float a);
  // Gets the width of the window.
  int GetWidth() { return width_; }
  // Gets the height of the window.
  int GetHeight() { return height_; }

  // Ensures that a OpenGL context exists, throws exception otherwise.
  static void EnsureCurrentContext();
  // Initializes the script object.
  static void InstallScript(
    v8::Isolate* isolate, v8::Handle<v8::ObjectTemplate> global);

private:

  Keyboard* keyboard_;
  GLFWwindow* glfwWindow_;
  int width_;
  int height_;

};


#endif