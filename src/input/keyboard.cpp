#include "input/keyboard.h"
#include "script/scriptobject.h"
#include "graphics/window.h"

#include <gl/glew.h>
#include <glfw/glfw3.h>

using namespace v8;

// Helps with setting up the script object.
class Keyboard::ScriptKeyboard : public ScriptObject<Keyboard> {

public:

  void Initialize()
  {
    ScriptObject::Initialize();
    AddFunction("isKeyDown", IsKeyDown);
    AddFunction("isKeyPress", IsKeyPress);
  }

  static void IsKeyDown(const FunctionCallbackInfo<Value>& args)
  {
    HandleScope scope(args.GetIsolate());
    auto self = Unwrap<Keyboard>(args.Holder());
    auto key = args[0]->NumberValue();
    auto value = self->IsKeyDown(key);
    args.GetReturnValue().Set(value);
  }

  static void IsKeyPress(const FunctionCallbackInfo<Value>& args)
  {
    HandleScope scope(args.GetIsolate());
    auto self = Unwrap<Keyboard>(args.Holder());
    auto key = args[0]->NumberValue();
    auto value = self->IsKeyPress(key);
    args.GetReturnValue().Set(value);
  }

private:

  // Inherit constructors.
  using ScriptObject::ScriptObject;

};

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

void Keyboard::InstallScript(
  Isolate* isolate, Handle<Object> parent, Keyboard* keyboard)
{
  ScriptKeyboard::InstallAsProperty<ScriptKeyboard>(
    isolate, "keyboard", parent, keyboard);
}