git clone https://chromium.googlesource.com/chromium/tools/depot_tools.git
export PATH=`pwd`/depot_tools:"$PATH"
gclient
cd deps
fetch v8
cd v8
git checkout tags/4.9.385.33
gclient sync --with_branch_heads --jobs 16
sed -i '' "s/'CLANG_CXX_LANGUAGE_STANDARD': 'gnu++0x'/& ,'CLANG_CXX_LIBRARY': 'libc++'/" build/standalone.gypi
sed -i '' "/cctest.gyp/d" build/all.gyp
sed -i '' "/unittests.gyp/d" build/all.gyp
make native