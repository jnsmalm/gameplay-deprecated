#ifndef MOUSE_H
#define MOUSE_H

#include "v8.h"
#include <map>

class Window;

class Mouse {

  // Class that is only available to mouse.
  class ScriptMouse;

public:

  Mouse(Window* window);

  bool IsButtonDown(int button);
  bool IsButtonPress(int button);
  double GetX();
  double GetY();
  void UpdateState();

  static void InstallScript(
    v8::Isolate* isolate, v8::Handle<v8::Object> parent, Mouse* mouse);

private:

  std::map<int,int> oldButtonState_;
  std::map<int,int> newButtonState_;
  Window* window_;

};

#endif