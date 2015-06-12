## JSPlay

Platform for building desktop games with JavaScript

### How to build for Mac OS X

#### Download and build V8

* Go to [Google's V8 website](https://developers.google.com/v8/build) and follow the intructions to download the source code for V8.
- Switch to git tag 4.5.9
- V8 must be built with c++11 and libc++, to do that you:
	- Change the value CLANG_CXX_LANGUAGE_STANDARD to gnu++11 in the build/standalone.gypi
	- Add CLANG_CXX_LIBRARY with value libc++ right under CLANG_CXX_LANGUAGE_STANDARD
	- Remember to modify it where it says 'clang==1'
- Build V8 using 'make native' (this will take a while).
- Copy or move the V8 folder to jsplay/deps

#### Build JSPlay

JSPlay uses the [CMake](http://www.cmake.org) build system.

```
mkdir build
cd build
cmake ..
make
```

