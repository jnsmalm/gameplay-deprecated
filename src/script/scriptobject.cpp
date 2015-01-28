#include "script/scriptobject.h"

using namespace v8;

void ScriptObject::BindFunction(Handle<ObjectTemplate> tmpl, const char* name, 
  FunctionCallback function)
{
  auto isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
  tmpl->Set(String::NewFromUtf8(isolate, name), 
  FunctionTemplate::New(isolate, function));
}

void ScriptObject::BindProperty(Handle<ObjectTemplate> tmpl, const char* name, 
  AccessorGetterCallback getter)
{
  auto isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
  tmpl->SetAccessor(String::NewFromUtf8(isolate, name), getter);
}