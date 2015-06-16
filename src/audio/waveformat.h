//
// Created by Jens Malmborg on 16/06/15.
//

#ifndef JSPLAY_WAVEFILE_H
#define JSPLAY_WAVEFILE_H

#include <iosfwd>
#include <string>

struct WaveFormat
{
public:
    static const unsigned short NUM_CHARS = 4;

public:
    WaveFormat() : data(nullptr) {
    }
    ~WaveFormat() {
        delete[] data;
    }

    static WaveFormat Load(std::string filename);

    char chunkID[NUM_CHARS];
    unsigned int chunkSize;
    char format[NUM_CHARS];
    char subChunkID[NUM_CHARS];
    unsigned int subChunkSize;
    unsigned short audioFormat;
    unsigned short numChannels;
    unsigned int sampleRate;
    unsigned int byteRate;
    unsigned short blockAlign;
    unsigned short bitsPerSample;
    char subChunk2ID[NUM_CHARS];
    unsigned int subChunk2Size;
    char* data;
};

#endif //JSPLAY_WAVEFILE_H
