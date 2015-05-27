#ifndef WINDOW_H
#define WINDOW_H

#include <gl/glew.h>
#include <glfw/glfw3.h>
#include "v8.h"
#include <string>

class Keyboard;
class Mouse;
class GraphicsDevice;

enum class PrimitiveT {
  TriangleList, LineList, PointList
};

class Window {

  friend class Keyboard;
  friend class Mouse;
  friend class GraphicsDevice;

  // Class that is only available to window.
  class ScriptWindow;
  

public:

  Window(std::string title, int width, int height, bool fullscreen);
  ~Window();

  // Gets the time since the window was created.
  double GetTime();
  // Gets a value indicating if the window is closing.
  bool IsClosing();
  // Closes the window.
  void Close();
  // Processes events of the application.
  void PollEvents();
  // Gets the width of the window.
  int GetWidth() { return width_; }
  // Gets the height of the window.
  int GetHeight() { return height_; }
  // Sets the title for the window.
  void SetTitle(std::string title);

  // Ensures that a OpenGL context exists, throws exception otherwise.
  static void EnsureCurrentContext();
  // Initializes the script object.
  static void InstallScript(
    v8::Isolate* isolate, v8::Handle<v8::ObjectTemplate> global);

private:

  Keyboard* keyboard_;
  Mouse* mouse_;
  GraphicsDevice* graphicsDevice_;
  GLFWwindow* glfwWindow_;
  int width_;
  int height_;

};


#endif