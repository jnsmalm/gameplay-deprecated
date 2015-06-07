#ifndef WINDOW_H
#define WINDOW_H

#include <gl/glew.h>
#include <glfw/glfw3.h>
#include "v8.h"
#include <string>
#include <script/ObjectScript.h>

class Keyboard;
class Mouse;
class GraphicsDevice;

enum class PrimitiveT {
  TriangleList, LineList, PointList
};

class Window : public ObjectScript<Window> {

  friend class Keyboard;
  friend class Mouse;
  friend class GraphicsDevice;

public:
  Window(v8::Isolate* isolate, std::string title, int width, int height,
         bool fullscreen);
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

  static void New(const v8::FunctionCallbackInfo<v8::Value>& args);

private:

    virtual void Initialize();

    static void GetTime(const v8::FunctionCallbackInfo<v8::Value>& args);
  static void IsClosing(const v8::FunctionCallbackInfo<v8::Value>& args);
  static void Close(const v8::FunctionCallbackInfo<v8::Value>& args);
  static void PollEvents(const v8::FunctionCallbackInfo<v8::Value>& args);
  static void GetWidth(v8::Local<v8::String> name,
                       const v8::PropertyCallbackInfo<v8::Value>& args);
  static void GetHeight(v8::Local<v8::String> name,
                       const v8::PropertyCallbackInfo<v8::Value>& args);
  static void SetTitle(const v8::FunctionCallbackInfo<v8::Value>& args);

  Keyboard* keyboard_;
  Mouse* mouse_;
  GraphicsDevice* graphicsDevice_;
  GLFWwindow* glfwWindow_;
  int width_;
  int height_;

};


#endif