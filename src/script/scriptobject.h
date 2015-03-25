#ifndef SCRIPTOBJECT_H
#define SCRIPTOBJECT_H

#include "v8.h"
#include <string>
#include <memory>

template <typename T>
class ScriptObject {

public:

  ScriptObject(v8::Isolate* isolate)
  {
    isolate_ = isolate;
  }

  v8::Handle<v8::Object> Wrap(T* ptr)
  {
    v8::EscapableHandleScope scope(isolate_);

    if (template_.IsEmpty()) {
      Initialize();
    }

    auto objectTemplate = GetTemplate();
    auto object = objectTemplate->NewInstance();
    object->SetInternalField(0, v8::External::New(isolate_, ptr));

    object_.Reset(isolate_, object);
    object_.SetWeak(this, WeakCallback);
    object_.MarkIndependent();

    ptr_ = std::unique_ptr<T>(ptr);

    return scope.Escape(object);
  }

  template <typename U>
  static void InstallAsConstructor(v8::Isolate* isolate,
    std::string name, v8::Handle<v8::ObjectTemplate> tmpl)
  {
    tmpl->Set(v8::String::NewFromUtf8(isolate, name.c_str()), 
      v8::FunctionTemplate::New(isolate, U::New));
  }

  template <typename U>
  static void InstallAsProperty(v8::Isolate* isolate,
    std::string name, v8::Handle<v8::Object> parent, T* object)
  {
    auto scriptObject = new U(isolate);
    parent->Set(v8::String::NewFromUtf8(isolate, name.c_str()), 
      scriptObject->Wrap(object));
  }

protected:

  virtual void Initialize()
  {
    auto objectTemplate = v8::ObjectTemplate::New(isolate_);
    objectTemplate->SetInternalFieldCount(1);
    template_.Reset(isolate_, objectTemplate);
  }

  void AddFunction(std::string name, v8::FunctionCallback function)
  {
    v8::HandleScope scope(isolate_);
    GetTemplate()->Set(v8::String::NewFromUtf8(isolate_, name.c_str()), 
      v8::FunctionTemplate::New(isolate_, function));
  }

  void AddAccessor(std::string name, v8::AccessorGetterCallback getter)
  {
    v8::HandleScope scope(isolate_);
    GetTemplate()->SetAccessor(
      v8::String::NewFromUtf8(isolate_, name.c_str()), getter);
  }

  v8::Handle<v8::ObjectTemplate> GetTemplate()
  {
    return v8::Local<v8::ObjectTemplate>::New(isolate_, template_);
  }

  template <typename U>
  static U* Unwrap(v8::Handle<v8::Object> object)
  {
    auto field = v8::Handle<v8::External>::Cast(object->GetInternalField(0));
    return static_cast<U*>(field->Value());
  }

private:

  static void WeakCallback(
    const v8::WeakCallbackData<v8::Object, ScriptObject<T>>& data)
  {
    auto scriptObject = data.GetParameter();
    scriptObject->object_.Reset();
    delete scriptObject;
  }

  static v8::Persistent<v8::ObjectTemplate> template_;

  std::unique_ptr<T> ptr_;
  v8::Persistent<v8::Object> object_;
  v8::Isolate* isolate_;

};

template <typename T>
v8::Persistent<v8::ObjectTemplate> ScriptObject<T>::template_;

#endif