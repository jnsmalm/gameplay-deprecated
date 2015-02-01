#include "input/keyboard.h"
#include "graphics/window.h"

#include <gl/glew.h>
#include <glfw/glfw3.h>

Keyboard::Keyboard(Window* window)
{
  window_ = window;
  // When sticky keys mode is enabled, the pollable state of a key will remain 
  // GLFW_PRESS until the state of that key is polled with glfwGetKey. Once it 
  // has been polled, if a key release event had been processed in the meantime, 
  // the state will reset to GLFW_RELEASE, otherwise it will remain GLFW_PRESS.
  glfwSetInputMode(window_->glfwWindow_, GLFW_STICKY_KEYS, 1);
}

bool Keyboard::IsKeyDown(int key)
{
  newKeyState_[key] = glfwGetKey(window_->glfwWindow_, key);
  return newKeyState_[key] == GLFW_PRESS;
}

bool Keyboard::IsKeyPress(int key)
{
  newKeyState_[key] = glfwGetKey(window_->glfwWindow_, key);
  return oldKeyState_[key] == GLFW_RELEASE && newKeyState_[key] == GLFW_PRESS;
}

void Keyboard::UpdateState()
{
  oldKeyState_ = newKeyState_;
}