/*The MIT License (MIT)

JSPlay Copyright (c) 2015 Jens Malmborg

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

#include "wave-format.h"
#include <fstream>

void WaveFormat::Load(std::string filename) {
    std::ifstream file(filename, std::ifstream::binary);
    if (file.good()) {
        file.read(chunkID, WaveFormat::NUM_CHARS);
        file.read(reinterpret_cast<char *>(&chunkSize),
                  sizeof(unsigned int));
        file.read(format, WaveFormat::NUM_CHARS);
        file.read(subChunkID, WaveFormat::NUM_CHARS);
        file.read(reinterpret_cast<char *>(&subChunkSize),
                  sizeof(unsigned int));
        file.read(reinterpret_cast<char *>(&audioFormat),
                  sizeof(unsigned short));
        file.read(reinterpret_cast<char *>(&numChannels),
                  sizeof(unsigned short));
        file.read(reinterpret_cast<char *>(&sampleRate),
                  sizeof(unsigned int));
        file.read(reinterpret_cast<char *>(&byteRate),
                  sizeof(unsigned int));
        file.read(reinterpret_cast<char *>(&blockAlign),
                  sizeof(unsigned short));
        file.read(reinterpret_cast<char *>(&bitsPerSample),
                  sizeof(unsigned short));
        do {
            file.read(subChunk2ID, WaveFormat::NUM_CHARS);
            file.read(reinterpret_cast<char *>(&subChunk2Size),
                      sizeof(unsigned int));
            data = new char[subChunk2Size];
            file.read(reinterpret_cast<char *>(data),
                      subChunk2Size);
        } while (strcmp(subChunk2ID, "data") != 0);
        file.close();
    }
}
