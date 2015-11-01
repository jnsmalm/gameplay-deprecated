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

#ifndef GAMEPLAY_FILEWATCHER_H
#define GAMEPLAY_FILEWATCHER_H

#include "v8.h"
#include <string>
#include <script/script-object-wrap.h>
#include <efsw/efsw.hpp>
#include <vector>

class FileWatcherEventHandler {

public:
    FileWatcherEventHandler(std::string filename) {
        filename_ = filename;
    }

    std::string filename() {
        return filename_;
    }

    virtual void Handle() = 0;

private:
    std::string filename_;

};

class FileWatcherListener : public efsw::FileWatchListener {

public:
    FileWatcherListener() {}

    void handleFileAction(efsw::WatchID watchid, const std::string& dir,
                          const std::string& filename, efsw::Action action,
                          std::string oldFilename = "" ) {

        if (action == efsw::Actions::Modified) {
            events_.push_back(dir + filename);
        }
    }

    void HandleEvents() {
        for(auto e: events_){
            for(int i=handlers_.size()-1; i>=0; i--) {
                if (handlers_[i]->filename() == e) {
                    handlers_[i]->Handle();
                }
            }
        }
        events_.clear();
    }

    void AddEventHandler(FileWatcherEventHandler* handler) {
        handlers_.push_back(handler);
    }

private:
    std::vector<FileWatcherEventHandler*> handlers_;
    std::vector<std::string> events_;

};

class FileWatcher : public ScriptObjectWrap<FileWatcher> {

public:
    FileWatcher(v8::Isolate *isolate, FileWatcherEventHandler* handler) :
            ScriptObjectWrap(isolate) {
        _listener.AddEventHandler(handler);
    }

    static void HandleEvents() {
        _listener.HandleEvents();
    }

    static void Start(std::string directory) {
        _watcher.addWatch(directory, &_listener, true);
    }

    static void New(const v8::FunctionCallbackInfo<v8::Value>& args);
    static void InstallAsConstructor(
            v8::Isolate* isolate, std::string name,
            v8::Handle<v8::ObjectTemplate> objectTemplate);

private:
    static FileWatcherListener _listener;
    static efsw::FileWatcher _watcher;

};

#endif // GAMEPLAY_FILEWATCHER_H