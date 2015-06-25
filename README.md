# JSPlay

Platform for building desktop games with JavaScript.

### Download the source from GitHub
```
git clone https://github.com/jnsmalm/jsplay.git
```

### Download and build V8

V8 is the JavaScript engine from Google used by JSPlay. The source for V8 needs
to be downloaded and compiled before building JSPlay.

##### Mac OS X

- Go to [Google's V8 website](https://developers.google.com/v8/build) and follow
the instructions to download the source code for V8.
- Switch to git tag 4.5.9
```
git checkout tags/4.5.9
```
- V8 must be built with c++11 and libc++, to do that you:
	- Change the value CLANG_CXX_LANGUAGE_STANDARD to gnu++11 in the
	build/standalone.gypi
	- Add CLANG_CXX_LIBRARY with value libc++ right under
	CLANG_CXX_LANGUAGE_STANDARD
	- Remember to modify it where it says 'clang==1'
- Build V8 using 'make native'.
- Copy or move the V8 folder to jsplay/deps.

##### Windows with Visual Studio

- Go to [Google's V8 website](https://developers.google.com/v8/build) and follow
the instructions to download the source code for V8.
- Switch to git tag 4.5.9
```
git checkout tags/4.5.9
```
- Follow the instructions for building V8 with Visual Studio, Use Visual Studio
2013 or later (it's doesn't seem to work with Visual Studio Express, instead try
Visual Studio Community).
- Before building: Copy the contents in depot_tools/python276_bin (you should
have that folder before getting the source for V8) to v8/third_party/python_26.
- Build for release.
- Copy or move the V8 folder to jsplay/deps.


### Build JSPlay

JSPlay uses the [CMake](http://www.cmake.org) build system. Supported is Make
for Mac OS X and Visual Studio for Windows. You can probably build it using
other tools but those have not been tested.

##### Mac OS X
```
cd jsplay
mkdir build
cd build
cmake ..
make
```

##### Windows

Generate Visual Studio solution with:
```
cd jsplay
md build
cd build
cmake .. -G "Visual Studio 12 2013"
```
If an error occur saying something like "Cannot find source file: 
CheckFileOffsetBits.c", try running the cmake command again. Open the created
Visual Studio solution and build as usual.
