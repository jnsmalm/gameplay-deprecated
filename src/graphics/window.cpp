#include "graphics/window.h"
#include "graphics/GraphicsDevice.h"
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
  auto monitor = fullscreen ? glfwGetPrimaryMonitor() : 0;

  return glfwCreateWindow(width, height, title.c_str(), monitor, NULL);
}

}

Window::Window(Isolate* isolate, std::string title, int width, int height,
               bool fullscreen) : ObjectScript(isolate) {
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



  glfwMakeContextCurrent(glfwWindow_);
  glfwSwapInterval(1);

  // Enable blending
  //glEnable(GL_BLEND);
  //glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);

    keyboard_ = new Keyboard(this);
    mouse_ = new Mouse(this);
    graphicsDevice_ = new GraphicsDevice(isolate, this);

  // Initialize glew to handle OpenGL extensions.
  glewExperimental = GL_TRUE;
  glewInit();
}

Window::~Window() {
  delete graphicsDevice_;
  glfwDestroyWindow(glfwWindow_);
  glfwTerminate();
}

bool Window::IsClosing() {
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

void Window::SetTitle(std::string title)
{
  glfwSetWindowTitle(glfwWindow_, title.c_str());
}

void Window::EnsureCurrentContext()
{
  if (!glfwGetCurrentContext()) {
    throw std::runtime_error("Window (OpenGL context) does not exist");
  }
}

void Window::Initialize() {
  ObjectScript::Initialize();
  SetFunction("close", Close);
  SetFunction("pollEvents", PollEvents);
  SetFunction("getTime", GetTime);
  SetFunction("isClosing", IsClosing);
  SetAccessor("width", GetWidth, NULL);
  SetAccessor("height", GetHeight, NULL);
  SetFunction("setTitle", SetTitle);
}

void Window::New(const FunctionCallbackInfo<Value>& args)
{
  HandleScope scope(args.GetIsolate());
  ScriptHelper helper(args.GetIsolate());

  auto arg = helper.GetObject(args[0]);
  auto title = helper.GetString(arg, "title", "Game");
  auto fullscreen = helper.GetBoolean(arg, "fullscreen", false);
  auto width = helper.GetInteger(arg, "width", 800);
  auto height = helper.GetInteger(arg, "height", 600);

  try {
    auto window = new Window(args.GetIsolate(), title, width, height,
                             fullscreen);
    auto object = window->getObject();

    Keyboard::InstallScript(args.GetIsolate(), object, window->keyboard_);
    Mouse::InstallScript(args.GetIsolate(), object, window->mouse_);

    window->graphicsDevice_->InstallAsObject("graphics", object);

    args.GetReturnValue().Set(object);
  }
  catch (std::exception& ex) {
    ScriptEngine::GetCurrent().ThrowTypeError(ex.what());
  }
}

void Window::Close(const FunctionCallbackInfo<Value>& args)
{
  HandleScope scope(args.GetIsolate());
  auto self = ObjectScript<Window>::GetSelf(args.Holder());
  self->Close();
}

void Window::GetTime(const FunctionCallbackInfo<Value>& args)
{
  HandleScope scope(args.GetIsolate());
  auto self = ObjectScript<Window>::GetSelf(args.Holder());
  args.GetReturnValue().Set(self->GetTime());
}

void Window::PollEvents(const FunctionCallbackInfo<Value>& args)
{
  HandleScope scope(args.GetIsolate());
  auto self = ObjectScript<Window>::GetSelf(args.Holder());
  self->PollEvents();
}

void Window::IsClosing(const FunctionCallbackInfo<Value>& args)
{
  HandleScope scope(args.GetIsolate());
  auto self = ObjectScript<Window>::GetSelf(args.Holder());
  args.GetReturnValue().Set(self->IsClosing());
}

void Window::GetWidth(
        Local<String> name, const PropertyCallbackInfo<Value>& args)
{
  HandleScope scope(args.GetIsolate());
  auto self = ObjectScript<Window>::GetSelf(args.Holder());
  args.GetReturnValue().Set(self->GetWidth());
}

void Window::GetHeight(
        Local<String> name, const PropertyCallbackInfo<Value>& args)
{
  HandleScope scope(args.GetIsolate());
  auto self = ObjectScript<Window>::GetSelf(args.Holder());
  args.GetReturnValue().Set(self->GetHeight());
}

void Window::SetTitle(const FunctionCallbackInfo<Value>& args)
{
  HandleScope scope(args.GetIsolate());
  ScriptHelper helper(args.GetIsolate());
  auto self = ObjectScript<Window>::GetSelf(args.Holder());
  auto title = helper.GetString(args[0]);
  self->SetTitle(title);
}
