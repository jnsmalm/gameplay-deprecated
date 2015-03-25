#ifndef KEYBOARD_H
#define KEYBOARD_H

#include "v8.h"
#include <map>

class Window;

class Keyboard {

  // Class that is only available to keyboard.
  class ScriptKeyboard;

public:

  Keyboard(Window* window);

  // Checks if the specified key is down.
  bool IsKeyDown(int key);
  // Checks if the specified key was pressed.
  bool IsKeyPress(int key);
  // Updates the state for the keyboard.
  void UpdateState();

  static void InstallScript(
    v8::Isolate* isolate, v8::Handle<v8::Object> parent, Keyboard* keyboard);

private:

  std::map<int,int> oldKeyState_;
  std::map<int,int> newKeyState_;
  Window* window_;

};

#endif