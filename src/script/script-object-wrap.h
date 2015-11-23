/*The MIT License (MIT)

Copyright (c) 2015 Jens Malmborg

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.*/

#ifndef JSPLAY_SCRIPTOBJECTWRAP_H
#define JSPLAY_SCRIPTOBJECTWRAP_H

#include <v8.h>
#include <string>

template <typename T>
class ScriptObjectWrap {

public:
    ScriptObjectWrap(v8::Isolate* isolate) : v8Isolate_(isolate) { }

    virtual ~ScriptObjectWrap() {
        if (!v8Object_.IsEmpty()) {
            // If the v8 object isn't empty when the destructor gets called, it
            // means that the destructor wasn't triggered from the weak
            // callback. Remove the weak callback so the destructor doesn't get
            // triggered a second time.
            v8Object_.ClearWeak();
        }
    };

    void InstallAsObject(std::string name, v8::Handle<v8::Object> parent) {
        parent->Set(v8::String::NewFromUtf8(
                v8Isolate_, name.c_str()), v8Object());
    }

    void InstallAsTemplate(
            std::string name, v8::Handle<v8::ObjectTemplate> parent) {
        parent->Set(v8::String::NewFromUtf8(
                v8Isolate_, name.c_str()), v8Template());
    }

    static void InstallAsConstructor(
            v8::Isolate* isolate, std::string name,
            v8::Handle<v8::ObjectTemplate> objectTemplate) {

        auto constructor = v8::FunctionTemplate::New(isolate, T::New);
        v8Constructor_.Reset(isolate, constructor);
        objectTemplate->Set(v8::String::NewFromUtf8(isolate, name.c_str()),
                            constructor);
    }

    static void SetConstructorFunction(v8::Isolate* isolate, std::string name,
            v8::FunctionCallback function) {

        v8::HandleScope scope(isolate);
        auto constructor = v8::Local<v8::FunctionTemplate>::New(
                isolate, v8Constructor_);
        constructor->Set(v8::String::NewFromUtf8(isolate, name.c_str()),
                         v8::FunctionTemplate::New(isolate, function));
    }

    static T* GetInternalObject(v8::Handle<v8::Object> object) {
        auto field = v8::Handle<v8::External>::Cast(object->GetInternalField(0));
        return static_cast<T*>(field->Value());
    }

    v8::Handle<v8::Object> v8Object() {
        if (v8Object_.IsEmpty()) {
            auto instance = v8Template()->NewInstance();
            instance->SetInternalField(0, v8::External::New(v8Isolate_, this));
            v8Object_.Reset(v8Isolate_, instance);
            v8Object_.SetWeak(this, WeakCallback);
            v8Object_.MarkIndependent();
        }
        return v8::Local<v8::Object>::New(v8Isolate_, v8Object_);
    }

    v8::Handle<v8::ObjectTemplate> v8Template() {
        if (v8Template_.IsEmpty()) {
            Initialize();
        }
        return v8::Local<v8::ObjectTemplate>::New(v8Isolate_, v8Template_);
    }

    v8::Isolate* v8Isolate() {
        return v8Isolate_;
    }

protected:
    virtual void Initialize() {
        v8::HandleScope scope(v8Isolate_);
        auto objectTemplate = v8::ObjectTemplate::New(v8Isolate_);
        objectTemplate->SetInternalFieldCount(1);
        v8Template_.Reset(v8Isolate_, objectTemplate);
    }

    void SetFunction(std::string name, v8::FunctionCallback function) {
        v8::HandleScope scope(v8Isolate_);
        v8Template()->Set(v8::String::NewFromUtf8(v8Isolate_, name.c_str()),
                           v8::FunctionTemplate::New(v8Isolate_, function));
    }

    void SetAccessor(std::string name, v8::AccessorGetterCallback getter,
                     v8::AccessorSetterCallback setter) {
        v8::HandleScope scope(v8Isolate_);
        v8Template()->SetAccessor(v8::String::NewFromUtf8(
                v8Isolate_, name.c_str()), getter, setter);
    }

    void SetIndexedPropertyHandler(v8::IndexedPropertyGetterCallback getter,
                                   v8::IndexedPropertySetterCallback setter) {
        v8::HandleScope scope(v8Isolate_);
        v8Template()->SetIndexedPropertyHandler(getter, setter);
    }

    void SetNamedPropertyHandler(v8::NamedPropertyGetterCallback getter,
                                 v8::NamedPropertySetterCallback setter) {
        v8::HandleScope scope(v8Isolate_);
        v8Template()->SetNamedPropertyHandler(getter, setter);
    }

private:
    static void WeakCallback(
            const v8::WeakCallbackData<v8::Object, ScriptObjectWrap<T>>& data) {
        auto scriptObject = data.GetParameter();
        scriptObject->v8Object_.Reset();
        delete scriptObject;
    }

    v8::Persistent<v8::Object> v8Object_;
    v8::Isolate* v8Isolate_;

    static v8::Persistent<v8::ObjectTemplate> v8Template_;
    static v8::Persistent<v8::FunctionTemplate> v8Constructor_;
};

template <typename T>
v8::Persistent<v8::ObjectTemplate> ScriptObjectWrap<T>::v8Template_;

template <typename T>
v8::Persistent<v8::FunctionTemplate> ScriptObjectWrap<T>::v8Constructor_;

#endif // JSPLAY_OBJECTSCRIPT_H
