#include "graphics/window.h"
#include "script/scriptengine.h"
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
class Window::ScriptWindow : public ScriptObject<ScriptWindow> {

public:

  void Setup()
  {
    AddFunction("swapBuffers", SwapBuffers);
    AddFunction("clear", Clear);
    AddFunction("close", Close);
    AddFunction("pollEvents", PollEvents);
    AddFunction("getTime", GetTime);
    AddFunction("isClosing", IsClosing);
    AddFunction("isKeyDown", IsKeyDown);
    AddFunction("isKeyPress", IsKeyPress);
  }

  static void New(const FunctionCallbackInfo<Value>& args) 
  {
    HandleScope scope(GetIsolate());
    try {
      // The first and only argument is an object.
      auto arg = args[0]->ToObject();

      // Get arguments from object.
      auto fullscreen = GetBoolean(arg, "fullscreen");
      auto width = (int)GetNumber(arg, "width");
      auto height = (int)GetNumber(arg, "height");

      // Create texture and wrap in a script object.
      auto object = Wrap(new Window(width, height, fullscreen));

      // Set script object as the result.
      args.GetReturnValue().Set(object);
    }
    catch (std::exception& ex) {
      ScriptEngine::GetCurrent().ThrowTypeError(ex.what());
    }
  }

  static void Close(const FunctionCallbackInfo<Value>& args) 
  {
    HandleScope scope(GetIsolate());
    auto self = Unwrap<Window>(args.Holder());
    self->Close();
  }

  static void GetTime(const FunctionCallbackInfo<Value>& args) 
  {
    HandleScope scope(GetIsolate());
    auto self = Unwrap<Window>(args.Holder());
    args.GetReturnValue().Set(self->GetTime());
  }

  static void PollEvents(const FunctionCallbackInfo<Value>& args) 
  {
    HandleScope scope(GetIsolate());
    auto self = Unwrap<Window>(args.Holder());
    self->PollEvents();
  }

  static void IsClosing(const FunctionCallbackInfo<Value>& args) 
  {
    HandleScope scope(GetIsolate());
    auto self = Unwrap<Window>(args.Holder());
    args.GetReturnValue().Set(self->IsClosing());
  }

  static void SwapBuffers(const FunctionCallbackInfo<Value>& args) 
  {
    HandleScope scope(GetIsolate());
    auto self = Unwrap<Window>(args.Holder());
    self->SwapBuffers();
  }

  static void Clear(const FunctionCallbackInfo<Value>& args) 
  {
    HandleScope scope(GetIsolate());
    auto self = Unwrap<Window>(args.Holder());
    self->Clear();
  }

  static void IsKeyDown(const FunctionCallbackInfo<Value>& args)
  {
    HandleScope scope(GetIsolate());
    auto self = Unwrap<Window>(args.Holder());
    auto key = args[0]->NumberValue();
    auto value = self->keyboard_->IsKeyDown(key);
    args.GetReturnValue().Set(value);
  }

  static void IsKeyPress(const FunctionCallbackInfo<Value>& args)
  {
    HandleScope scope(GetIsolate());
    auto self = Unwrap<Window>(args.Holder());
    auto key = args[0]->NumberValue();
    auto value = self->keyboard_->IsKeyPress(key);
    args.GetReturnValue().Set(value);
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

void Window::Init(Isolate* isolate, Handle<ObjectTemplate> parent)
{
  ScriptWindow::GetCurrent().Init(isolate, "Window", parent);
}