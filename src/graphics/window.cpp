#include "graphics/window.h"
#include "script/scriptengine.h"
#include "script/scriptobject.h"
#include "script/scripthelper.h"
#include "input/mouse.h"
#include "input/keyboard.h"

using namespace v8;

namespace {

GLFWwindow* CreateWindow(
  std::string title, int width, int height, bool fullscreen)
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

  return glfwCreateWindow(width, height, title.c_str(), monitor, NULL);
}

}

// Helps with setting up the script object.
class Window::ScriptWindow : public ScriptObject<Window> {

public:

  void Initialize()
  {
    ScriptObject::Initialize();
    AddFunction("swapBuffers", SwapBuffers);
    AddFunction("clear", Clear);
    AddFunction("close", Close);
    AddFunction("pollEvents", PollEvents);
    AddFunction("getTime", GetTime);
    AddFunction("isClosing", IsClosing);
    AddAccessor("width", GetWidth);
    AddAccessor("height", GetHeight);
    AddFunction("setTitle", SetTitle);
    AddAccessor("syncWithVerticalRetrace", NULL, SetSyncWithVerticalRetrace);
  }

  static void New(const FunctionCallbackInfo<Value>& args) 
  {
    HandleScope scope(args.GetIsolate());
    ScriptHelper helper(args.GetIsolate());

    auto arg = helper.GetObject(args[0]);
    auto title = helper.GetString(arg, "title", "Game");
    auto fullscreen = helper.GetBoolean(arg, "fullscreen");
    auto width = helper.GetInteger(arg, "width", 800);
    auto height = helper.GetInteger(arg, "height", 600);

    try {
      auto scriptObject = new ScriptWindow(args.GetIsolate());
      auto window = new Window(title, width, height, fullscreen);
      auto object = scriptObject->Wrap(window);

      Keyboard::InstallScript(args.GetIsolate(), object, window->keyboard_);
      Mouse::InstallScript(args.GetIsolate(), object, window->mouse_);

      args.GetReturnValue().Set(object);
    }
    catch (std::exception& ex) {
      ScriptEngine::GetCurrent().ThrowTypeError(ex.what());
    }
  }

  static void Close(const FunctionCallbackInfo<Value>& args) 
  {
    HandleScope scope(args.GetIsolate());
    auto self = Unwrap<Window>(args.Holder());
    self->Close();
  }

  static void GetTime(const FunctionCallbackInfo<Value>& args) 
  {
    HandleScope scope(args.GetIsolate());
    auto self = Unwrap<Window>(args.Holder());
    args.GetReturnValue().Set(self->GetTime());
  }

  static void PollEvents(const FunctionCallbackInfo<Value>& args) 
  {
    HandleScope scope(args.GetIsolate());
    auto self = Unwrap<Window>(args.Holder());
    self->PollEvents();
  }

  static void IsClosing(const FunctionCallbackInfo<Value>& args) 
  {
    HandleScope scope(args.GetIsolate());
    auto self = Unwrap<Window>(args.Holder());
    args.GetReturnValue().Set(self->IsClosing());
  }

  static void SwapBuffers(const FunctionCallbackInfo<Value>& args) 
  {
    HandleScope scope(args.GetIsolate());
    auto self = Unwrap<Window>(args.Holder());
    self->SwapBuffers();
  }

  static void Clear(const FunctionCallbackInfo<Value>& args) 
  {
    HandleScope scope(args.GetIsolate());
    ScriptHelper helper(args.GetIsolate());

    auto self = Unwrap<Window>(args.Holder());
    auto arg = helper.GetObject(args[0]);
    auto r = helper.GetFloat(arg, "r");
    auto g = helper.GetFloat(arg, "g");
    auto b = helper.GetFloat(arg, "b");
    auto a = helper.GetFloat(arg, "a");

    self->Clear(r, g, b, a);
  }

  static void GetWidth(
    Local<String> name, const PropertyCallbackInfo<Value>& args) 
  {
    HandleScope scope(args.GetIsolate());
    auto self = Unwrap<Window>(args.Holder());
    args.GetReturnValue().Set(self->GetWidth());
  }

  static void GetHeight(
    Local<String> name, const PropertyCallbackInfo<Value>& args) 
  {
    HandleScope scope(args.GetIsolate());
    auto self = Unwrap<Window>(args.Holder());
    args.GetReturnValue().Set(self->GetHeight());
  }

  static void SetTitle(const FunctionCallbackInfo<Value>& args) 
  {
    HandleScope scope(args.GetIsolate());
    ScriptHelper helper(args.GetIsolate());
    auto self = Unwrap<Window>(args.Holder());
    auto title = helper.GetString(args[0]);
    self->SetTitle(title);
  }

  static void SetSyncWithVerticalRetrace(Local<String> property, 
    Local<Value> value, const PropertyCallbackInfo<void>& info) 
  {
    HandleScope scope(info.GetIsolate());
    auto self = Unwrap<Window>(info.Holder());
    self->SetSyncWithVerticalRetrace(value->BooleanValue());
  }

private:

  // Inherit constructors.
  using ScriptObject::ScriptObject;

};

Window::Window(std::string title, int width, int height, bool fullscreen) 
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

  glfwWindow_ = CreateWindow(title, width, height, fullscreen);

  if (!glfwWindow_) {
    // Something went wrong while creating the window.
    glfwTerminate();
    return;
  }

  glfwGetWindowSize(glfwWindow_, &width_, &height_);

  keyboard_ = new Keyboard(this);
  mouse_ = new Mouse(this);

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
  mouse_->UpdateState();
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

void Window::Clear(float r, float g, float b, float a)
{
  glClearColor(r, g, b, a);
  glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT | GL_STENCIL_BUFFER_BIT);
}

void Window::SetTitle(std::string title)
{
  glfwSetWindowTitle(glfwWindow_, title.c_str());
}

void Window::SetSyncWithVerticalRetrace(bool value)
{
  glfwSwapInterval(value);
}

void Window::EnsureCurrentContext()
{
  if (!glfwGetCurrentContext()) {
    throw std::runtime_error("Window (OpenGL context) does not exist");
  }
}

void Window::InstallScript(Isolate* isolate, Handle<ObjectTemplate> parent)
{
  ScriptWindow::InstallAsConstructor<ScriptWindow>(isolate, "Window", parent);
}