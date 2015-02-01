#ifndef KEYBOARD_H
#define KEYBOARD_H

#include <map>

class Window;

class Keyboard {

public:

  Keyboard(Window* window);

  // Checks if the specified key is down.
  bool IsKeyDown(int key);
  // Checks if the specified key was pressed.
  bool IsKeyPress(int key);
  // Updates the state for the keyboard.
  void UpdateState();

private:

  std::map<int,int> oldKeyState_;
  std::map<int,int> newKeyState_;
  Window* window_;

};

#endif