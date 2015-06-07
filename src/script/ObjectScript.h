#ifndef OBJECTSCRIPT_H
#define OBJECTSCRIPT_H

#include <v8.h>
#include <string>

template <typename T>
class ObjectScript {

public:
    ObjectScript(v8::Isolate* isolate) : isolate_(isolate) { }
    virtual ~ObjectScript() { };

    v8::Handle<v8::Object> InstallAsObject(std::string name,
                                           v8::Handle<v8::Object> parent) {
        parent->Set(v8::String::NewFromUtf8(isolate_, name.c_str()),
                    this->getObject());
        return this->getObject();
    }

    v8::Handle<v8::Object> getObject() {
        if (object_.IsEmpty()) {
            NewInstance();
        }
        return v8::Local<v8::Object>::New(isolate_, object_);
    }

    static void InstallAsConstructor(
            v8::Isolate *isolate, std::string name,
            v8::Handle<v8::ObjectTemplate> objectTemplate) {
        auto tpl = v8::FunctionTemplate::New(isolate, T::New);
        tpl->SetClassName(v8::String::NewFromUtf8(isolate, "Meeegga"));
        objectTemplate->Set(v8::String::NewFromUtf8(isolate, name.c_str()),
                  tpl);
    }

    static T* GetSelf(v8::Handle<v8::Object> object) {
        auto field = v8::Handle<v8::External>::Cast(object->GetInternalField(0));
        return static_cast<T*>(field->Value());
    }

protected:
    virtual void Initialize() {
        auto objectTemplate = v8::ObjectTemplate::New(isolate_);
        objectTemplate->SetInternalFieldCount(1);
        template_.Reset(isolate_, objectTemplate);
    }

    void SetFunction(std::string name, v8::FunctionCallback function) {
        v8::HandleScope scope(isolate_);
        getTemplate()->Set(v8::String::NewFromUtf8(isolate_, name.c_str()),
                           v8::FunctionTemplate::New(isolate_, function));
    }

    void SetAccessor(std::string name, v8::AccessorGetterCallback getter,
                     v8::AccessorSetterCallback setter) {
        v8::HandleScope scope(isolate_);
        getTemplate()->SetAccessor(v8::String::NewFromUtf8(
                isolate_, name.c_str()), getter, setter);
    }

    void SetIndexedPropertyHandler(v8::IndexedPropertyGetterCallback getter,
                                   v8::IndexedPropertySetterCallback setter) {
        getTemplate()->SetIndexedPropertyHandler(getter, setter);
    }

    void SetNamedPropertyHandler(v8::NamedPropertyGetterCallback getter,
                                 v8::NamedPropertySetterCallback setter) {
        getTemplate()->SetNamedPropertyHandler(getter, setter);
    }

private:
    void NewInstance() {
        auto instance = getTemplate()->NewInstance();
        instance->SetInternalField(0, v8::External::New(isolate_, this));
        object_.Reset(isolate_, instance);
        object_.SetWeak(this, WeakCallback);
        object_.MarkIndependent();
    }

    v8::Handle<v8::ObjectTemplate> getTemplate() {
        if (template_.IsEmpty()) {
            Initialize();
        }
        return v8::Local<v8::ObjectTemplate>::New(isolate_, template_);
    }

    static void WeakCallback(
            const v8::WeakCallbackData<v8::Object, ObjectScript<T>>& data) {
        auto scriptObject = data.GetParameter();
        scriptObject->object_.Reset();
        delete scriptObject;
    }

    v8::Persistent<v8::Object> object_;
    v8::Isolate* isolate_;
    static v8::Persistent<v8::ObjectTemplate> template_;
};

template <typename T>
v8::Persistent<v8::ObjectTemplate> ObjectScript<T>::template_;

#endif
