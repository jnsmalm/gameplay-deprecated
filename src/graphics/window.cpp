#include "graphics/window.h"
#include "script/scriptengine.h"
#include "script/scriptargs.h"
#include "script/scriptobject.h"
#include "input/keyboard.h"

using namespace v8;

namespace {

GLFWwindow* CreateWindow(int width, int height, bool fullscreen)
{
  // Use OpenGL Core v3.2
  glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
  glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 2);
  glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT, GL_TRUE);
  glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);

  // Set other window properties.
  glfwWindowHint(GLFW_RESIZABLE, GL_FALSE);

  // Get primary monitor when fullscreen.
  auto monitor = fullscreen ? glfwGetPrimaryMonitor() : NULL;

  return glfwCreateWindow(width, height, "Game", monitor, NULL);
}

}

// Helps with setting up the script object.
class Window::ScriptWindow {

public:

  static void Close(const FunctionCallbackInfo<Value>& args) 
  {
    auto self = ScriptArgs::GetThis<Window>(args);
    self->Close();
  }

  static void GetTime(const FunctionCallbackInfo<Value>& args) 
  {
    auto self = ScriptArgs::GetThis<Window>(args);
    ScriptArgs::SetNumberResult(args, self->GetTime());
  }

  static void PollEvents(const FunctionCallbackInfo<Value>& args) 
  {
    auto self = ScriptArgs::GetThis<Window>(args);
    self->PollEvents();
  }

  static void IsClosing(const FunctionCallbackInfo<Value>& args) 
  {
    auto self = ScriptArgs::GetThis<Window>(args);
    ScriptArgs::SetBooleanResult(args, self->IsClosing());
  }

  static void SwapBuffers(const FunctionCallbackInfo<Value>& args) 
  {
    auto self = ScriptArgs::GetThis<Window>(args);
    self->SwapBuffers();
  }

  static void Clear(const FunctionCallbackInfo<Value>& args) 
  {
    auto self = ScriptArgs::GetThis<Window>(args);
    self->Clear();
  }

  static void IsKeyDown(const FunctionCallbackInfo<Value>& args)
  {
    auto self = ScriptArgs::GetThis<Window>(args);
    auto key = ScriptArgs::GetNumber(args, 0);
    ScriptArgs::SetBooleanResult(args, self->keyboard_->IsKeyDown(key));
  }

  static void IsKeyPress(const FunctionCallbackInfo<Value>& args)
  {
    auto self = ScriptArgs::GetThis<Window>(args);
    auto key = ScriptArgs::GetNumber(args, 0);
    ScriptArgs::SetBooleanResult(args, self->keyboard_->IsKeyPress(key));
  }

  static void Setup(Local<ObjectTemplate> tmpl)
  {
    ScriptObject::BindFunction(tmpl, "swapBuffers", SwapBuffers);
    ScriptObject::BindFunction(tmpl, "clear", Clear);
    ScriptObject::BindFunction(tmpl, "close", Close);
    ScriptObject::BindFunction(tmpl, "pollEvents", PollEvents);
    ScriptObject::BindFunction(tmpl, "getTime", GetTime);
    ScriptObject::BindFunction(tmpl, "isClosing", IsClosing);
    ScriptObject::BindFunction(tmpl, "isKeyDown", IsKeyDown);
    ScriptObject::BindFunction(tmpl, "isKeyPress", IsKeyPress);
  }

};

Window::Window(int width, int height, bool fullscreen) 
{
  // Setup anonymous function to throw exception if anything goes wrong in glfw.
  glfwSetErrorCallback([](int error, const char* description)
    {
      throw std::runtime_error(description);
    });

  if (!glfwInit()) {
    // Something went wrong while initializing glfw.
    return;
  }

  glfwWindow_ = CreateWindow(width, height, fullscreen);

  if (!glfwWindow_) {
    // Something went wrong while creating the window.
    glfwTerminate();
    return;
  }

  // Create the keyboard associated with this window.
  keyboard_ = new Keyboard(this);

  glfwMakeContextCurrent(glfwWindow_);
  glfwSwapInterval(1);

  // Initialize glew to handle OpenGL extensions.
  glewExperimental = GL_TRUE;
  glewInit();
}

Window::~Window() 
{
  glfwDestroyWindow(glfwWindow_);
  glfwTerminate();
}

bool Window::IsClosing() 
{
  return glfwWindowShouldClose(glfwWindow_);
}

void Window::Close() 
{
  glfwSetWindowShouldClose(glfwWindow_, GL_TRUE);
}

void Window::PollEvents() 
{
  keyboard_->UpdateState();
  glfwPollEvents();
}

double Window::GetTime() 
{
  return glfwGetTime();
}

void Window::SwapBuffers()
{
  glfwSwapBuffers(glfwWindow_);
}

void Window::Clear()
{
  glClearColor(100.0/255.0, 149.0/255.0, 237.0/255.0, 1);
  glClear(GL_COLOR_BUFFER_BIT);
}

void Window::EnsureCurrentContext()
{
  if (!glfwGetCurrentContext()) {
    throw std::runtime_error("Window (OpenGL context) does not exist");
  }
}

void Window::New(const FunctionCallbackInfo<Value>& args) 
{
  try {
    // Get arguments to create the window.
    auto width = (int)ScriptArgs::GetNumber(args, 0);
    auto height = (int)ScriptArgs::GetNumber(args, 1);
    auto fullscreen = ScriptArgs::GetBoolean(args, 2);

    // Create texture and wrap in a script object.
    auto window = new Window(width, height, fullscreen);
    auto object = ScriptObject::Wrap(window, Window::ScriptWindow::Setup);

    // Set script object as the result.
    ScriptArgs::SetObjectResult(args, object);
  }
  catch (std::exception& ex) {
    ScriptEngine::GetCurrent().ThrowTypeError(ex.what());
  }
}