//
// Created by Jens Malmborg on 16/06/15.
//

#include "waveformat.h"
#include <fstream>

WaveFormat WaveFormat::Load(std::string filename) {
    WaveFormat result;

    std::ifstream file(filename, std::ifstream::binary);
    if (file.good()) {
        file.read(result.chunkID, WaveFormat::NUM_CHARS);
        file.read(reinterpret_cast<char *>(&result.chunkSize),
                  sizeof(unsigned int));
        file.read(result.format, WaveFormat::NUM_CHARS);
        file.read(result.subChunkID, WaveFormat::NUM_CHARS);
        file.read(reinterpret_cast<char *>(&result.subChunkSize),
                  sizeof(unsigned int));
        file.read(reinterpret_cast<char *>(&result.audioFormat),
                  sizeof(unsigned short));
        file.read(reinterpret_cast<char *>(&result.numChannels),
                  sizeof(unsigned short));
        file.read(reinterpret_cast<char *>(&result.sampleRate),
                  sizeof(unsigned int));
        file.read(reinterpret_cast<char *>(&result.byteRate),
                  sizeof(unsigned int));
        file.read(reinterpret_cast<char *>(&result.blockAlign),
                  sizeof(unsigned short));
        file.read(reinterpret_cast<char *>(&result.bitsPerSample),
                  sizeof(unsigned short));
        file.read(result.subChunk2ID, WaveFormat::NUM_CHARS);
        file.read(reinterpret_cast<char *>(&result.subChunk2Size),
                  sizeof(unsigned int));
        result.data = new char[result.subChunk2Size];
        file.read(reinterpret_cast<char *>(result.data),
                  result.subChunk2Size);
        file.close();
    }

    return result;
}
