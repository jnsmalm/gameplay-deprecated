VERSION="0.7.1"

# Get precompiled libs for V8
curl -L https://github.com/jnsmalm/build-v8/releases/download/v4.9.385.33.2/libv8-4.9.385.33.2-darwin-64bit.tar.gz -o libv8.tar.gz
mkdir deps/v8/lib && tar -xvzf libv8.tar.gz -C deps/v8/lib

# Build
mkdir build && cd build && cmake .. && make && cd ..

# Get assimp2json
curl -L https://github.com/jnsmalm/build-assimp2json/releases/download/v2.0.1/assimp2json-v2.0.1-osx.tar.gz -o assimp2json.tar.gz
mkdir bin/assimp2json && tar -xvzf assimp2json.tar.gz -C bin/assimp2json

# Compile typescript
tsc

# Copy to dist
mkdir dist && cp -rf {bin,samples,lib,LICENSE,tsconfig.json} dist

# Archive dist
cd dist && tar -zcvf ../gameplay-v$VERSION-mac.tar.gz .