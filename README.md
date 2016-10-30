# Gameplay.js

[![Build Status](https://travis-ci.org/jnsmalm/gameplay.svg?branch=master)](https://travis-ci.org/jnsmalm/gameplay)
[![Build status](https://ci.appveyor.com/api/projects/status/h2r3d2ecyanojt9f/branch/master?svg=true)](https://ci.appveyor.com/project/jnsmalm/gameplay/branch/master)

Gameplay.js is a JavaScript runtime for desktop games. It does not run inside a web browser, instead it runs as a native application on the current platform (OS X or Windows). See website at [gameplayjs.com](http://www.gameplayjs.com)

### Build instructions

#####1. Get source
```
git clone https://github.com/jnsmalm/gameplay.git
```

#####2. Get precompiled libs for V8
V8 is the JavaScript engine from Google used by Gameplay. The precompiled libraries for V8 needs to be downloaded and installed before building Gameplay.

  * [V8 4.9.385.33 (OS X)](https://github.com/jnsmalm/build-v8/releases/download/v4.9.385.33.2/libv8-4.9.385.33.2-darwin-64bit.tar.gz)
  * [V8 4.9.385.33 (Windows)](https://github.com/jnsmalm/build-v8/releases/download/v4.9.385.33.2/libv8-4.9.385.33.2-windows-32bit.zip)
  
Unpack the archive and copy the contents to gameplay/deps/v8/lib.

#####3. Build
Gameplay uses the [CMake](http://www.cmake.org) build system which can generate many different workspaces. Visual Studio 2015 in Windows and Make in OS X has been tested.

```
cd gameplay && mkdir build && cd build && cmake .. && make
```