#include "input/mouse.h"
#include "script/scriptobject.h"
#include "graphics/window.h"

#include <gl/glew.h>
#include <glfw/glfw3.h>

using namespace v8;

// Helps with setting up the script object.
class Mouse::ScriptMouse : public ScriptObject<Mouse> {

public:

  void Initialize()
  {
    ScriptObject::Initialize();
    AddAccessor("x", GetX);
    AddAccessor("y", GetY);
    AddFunction("isButtonDown", IsButtonDown);
    AddFunction("isButtonPress", IsButtonPress);
  }

  static void GetX(Local<String> name, const PropertyCallbackInfo<Value>& args)
  {
    HandleScope scope(args.GetIsolate());
    auto self = Unwrap<Mouse>(args.Holder());
    args.GetReturnValue().Set(self->GetX());
  }

  static void GetY(Local<String> name, const PropertyCallbackInfo<Value>& args)
  {
    HandleScope scope(args.GetIsolate());
    auto self = Unwrap<Mouse>(args.Holder());
    args.GetReturnValue().Set(self->GetY());
  }

  static void IsButtonDown(const FunctionCallbackInfo<Value>& args) 
  {
    HandleScope scope(args.GetIsolate());
    auto self = Unwrap<Mouse>(args.Holder());
    auto button = args[0]->NumberValue();
    auto value = self->IsButtonDown(button);
    args.GetReturnValue().Set(value);
  }

  static void IsButtonPress(const FunctionCallbackInfo<Value>& args) 
  {
    HandleScope scope(args.GetIsolate());
    auto self = Unwrap<Mouse>(args.Holder());
    auto button = args[0]->NumberValue();
    auto value = self->IsButtonPress(button);
    args.GetReturnValue().Set(value);
  }

private:

  // Inherit constructors.
  using ScriptObject::ScriptObject;

};

Mouse::Mouse(Window* window)
{
  window_ = window;
  // Whenever you poll state, you risk missing the state change you are looking 
  // for. If a pressed mouse button is released again before you poll its state, 
  // you will have missed the button press. The recommended solution for this is 
  // to use a mouse button callback, but there is also the 
  // GLFW_STICKY_MOUSE_BUTTONS input mode.
  glfwSetInputMode(window_->glfwWindow_, GLFW_STICKY_MOUSE_BUTTONS, 1);
}

bool Mouse::IsButtonDown(int button)
{
  newButtonState_[button] = glfwGetMouseButton(window_->glfwWindow_, button);
  return newButtonState_[button] == GLFW_PRESS;
}

bool Mouse::IsButtonPress(int button)
{
  newButtonState_[button] = glfwGetMouseButton(window_->glfwWindow_, button);
  return oldButtonState_[button] == GLFW_RELEASE && 
    newButtonState_[button] == GLFW_PRESS;
}

double Mouse::GetX()
{
  double x, y;
  glfwGetCursorPos(window_->glfwWindow_, &x, &y);
  return x;
}

double Mouse::GetY()
{
  double x, y;
  glfwGetCursorPos(window_->glfwWindow_, &x, &y);
  return y;
}

void Mouse::UpdateState()
{
  oldButtonState_ = newButtonState_;
}

void Mouse::InstallScript(
  Isolate* isolate, Handle<Object> parent, Mouse* mouse)
{
  ScriptMouse::InstallAsProperty<ScriptMouse>(
    isolate, "mouse", parent, mouse);
}