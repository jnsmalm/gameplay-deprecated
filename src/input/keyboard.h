#ifndef KEYBOARD_H
#define KEYBOARD_H

#include "v8.h"
#include <gl/glew.h>
#include <glfw/glfw3.h>
#include <map>

class Window;

class Keyboard {

public:

  Keyboard(Window* window);

  // Updates the state for the keyboard.
  void UpdateState();
  // Checks if the specified key is down.
  bool IsKeyDown(int key);
  // Checks if the specified key was pressed.
  bool IsKeyPress(int key);

  // Creates a new script instance.
  static void New(const v8::FunctionCallbackInfo<v8::Value>& args);

private:

  std::map<int,int> oldKeyState_;
  std::map<int,int> newKeyState_;
  Window* window_;

};

#endif