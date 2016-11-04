set VERSION="0.7.1"

:: Get precompiled libs for V8
curl -L https://github.com/jnsmalm/build-v8/releases/download/v4.9.385.33.2/libv8-4.9.385.33.2-windows-32bit.zip -o libv8.zip
md deps\v8\lib && 7z x libv8.zip -odeps\v8\lib

:: Build
md build && cd build && cmake .. -G "Visual Studio 14 2015" & cd..
msbuild build\gameplay.sln /t:Build /p:Configuration=Release
move bin\release\gameplay.exe bin\gameplay.exe

:: Get assimp2json
curl -L https://github.com/jnsmalm/build-assimp2json/releases/download/v2.0.1/assimp2json-v2.0.1-win.zip -o assimp2json.zip
md bin\assimp2json && 7z x assimp2json.zip -obin\assimp2json

:: Compile typescript
call tsc

:: Copy to dist
xcopy bin dist\bin\ /s /h
xcopy samples dist\samples\ /s /h
xcopy lib dist\lib\ /s /h
xcopy tsconfig.json dist\* /y
xcopy LICENSE dist\* /y

:: Archive dist
cd dist && 7z a -tzip ..\gameplay-v%VERSION%-win.zip *