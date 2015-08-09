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

#ifndef GAMEPLAY_FILEPATH_H
#define GAMEPLAY_FILEPATH_H

#include <string>
#include <assert.h>

class PathHelper {

public:
    static std::string Normalize(std::string filepath) {
        std::string result = filepath;
        while (result.find("../", 2) != std::string::npos) {
            auto pos = result.find("../", 2);
            auto end = result.rfind("/", pos - 1);
            auto beg = result.rfind("/", end - 1);
            if (end == std::string::npos) {
                end = 0;
            }
            if (beg == std::string::npos) {
                beg = 0;
            }
            result.erase(pos, 3);
            result.erase(beg, end - beg + 1);
        }
        return result;
    }
};


#endif //GAMEPLAY_FILEPATH_H
