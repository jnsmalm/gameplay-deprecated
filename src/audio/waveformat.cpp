//
// Created by Jens Malmborg on 16/06/15.
//

#include "waveformat.h"
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
