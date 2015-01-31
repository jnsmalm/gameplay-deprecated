#include "input/keyboard.h"
#include "graphics/window.h"
#include "script/scriptengine.h"
#include "script/scriptargs.h"

using namespace v8;

namespace {

// Helps with setting up the script object.
class ScriptKeyboard {

public:

  static void IsKeyDown(const FunctionCallbackInfo<Value>& args)
  {
    auto self = ScriptArgs::GetThis<Keyboard>(args);
    auto key = ScriptArgs::GetNumber(args, 0);
    ScriptArgs::SetBooleanResult(args, self->IsKeyDown(key));
  }

  static void IsKeyPress(const FunctionCallbackInfo<Value>& args)
  {
    auto self = ScriptArgs::GetThis<Keyboard>(args);
    auto key = ScriptArgs::GetNumber(args, 0);
    ScriptArgs::SetBooleanResult(args, self->IsKeyPress(key));
  }

  static void UpdateState(const FunctionCallbackInfo<Value>& args)
  {
    auto keyboard = ScriptArgs::GetThis<Keyboard>(args);
    keyboard->UpdateState();
  }

  static void Setup(Local<ObjectTemplate> tmpl)
  {
    ScriptObject::BindFunction(tmpl, "updateState", UpdateState);
    ScriptObject::BindFunction(tmpl, "isKeyDown", IsKeyDown);
    ScriptObject::BindFunction(tmpl, "isKeyPress", IsKeyPress);
  }

};

}

Keyboard::Keyboard(Window* window)
{
  window_ = window;
  glfwSetInputMode(window->glfwWindow_, GLFW_STICKY_KEYS, 1);
}

void Keyboard::UpdateState()
{
  oldKeyState_ = newKeyState_;
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

void Keyboard::New(const FunctionCallbackInfo<Value>& args)
{
  try {
    // Get the window argument.
    auto window = ScriptArgs::GetObject<Window>(args, 0);

    // Create keyboard and wrap in a script object.
    auto keyboard = new Keyboard(window);
    auto object = ScriptObject::Wrap(keyboard, ScriptKeyboard::Setup);

    // Set script object as the result.
    ScriptArgs::SetObjectResult(args, object);
  }
  catch (std::exception& ex) {
    ScriptEngine::GetCurrent().ThrowTypeError(ex.what());
  }
}