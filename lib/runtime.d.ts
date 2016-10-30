/*The MIT License (MIT)

Copyright (c) 2016 Jens Malmborg

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

declare const module: {
    /**
     * Returns the file name of the current module.
     */
    filename: string,
    /**
     * Returns the path of the current module.
     */
    path: string
};

declare const console: {
    log(...param: any[]): void
};

/**
 * Loads a module with the specified name and caches the result. Returns the
 * same object (for each module name) every time.
 */
declare function require(name: string): any;

/**
 * Loads a module with the specified name. Returns a new object every time.
 */
declare function load(name: string): any;

declare const file: {
    /**
     * Reads the text from a file with given file name.
     */
    readText(filepath: string): string;
}

/**
 * Watches for file changes..
 */
declare class FileWatcher {
    /**
     * Creates a new file watcher.
     */
    constructor(filepath: string, callback: () => void);
    /**
     * Start watching the root folder for changes.
     */
    static start(): void;
    /**
     * Calls all the specified callbacks.
     */
    static handleEvents(): void;
}

/**
 * Contains blend state for the graphics.
 */
declare type BlendState = "alphaBlend" | "opaque" | "additive";

/**
 * Contains depth state for the graphics.
 */
declare type DepthState = "default" | "read" | "none";

/**
 * Contains rasterizer state for the graphics.
 */
declare type RasterizerState = 
    "cullNone" | "cullClockwise" | "cullCounterClockwise";

/**
 * Defines how vertex data is ordered.
 */
declare type PrimitiveType = "triangleList" | "pointList" | "lineList";

/**
 * Performs primitive-based rendering.
 */
declare class Graphics {
    blendState: BlendState;
    /**
     * Clears the back buffer.
     */
    clear(clearType: string, color: { 
        r: number, g: number, b: number, a: number 
    }): void;
    depthState: DepthState;
    /**
     * Renders the specified geometric primitive, based on indexing into an 
     * array of vertices.
     */
    drawIndexedPrimitives(options: {
        primitiveType: PrimitiveType;
        indexStart?: number;
        primitiveCount: number;
    }): void;
    /**
     * Renders a sequence of non-indexed geometric primitives.
     */
    drawPrimitives(options: {
        primitiveType: PrimitiveType;
        vertexStart?: number;
        primitiveCount: number;
    }): void;
    /**
     * Returns the collection of textures that have been assigned to the 
     * texture stages of the device.
     */
    textures: Texture2D[];
    /**
     * Presents the display with the contents of the next buffer.
     */
    present(): void;
    rasterizerState: RasterizerState;

    setRenderTarget(renderTarget: RenderTarget): void;
    setVertexSpecification(specification: VertexSpecification): void;
    setShaderProgram(program: ShaderProgram): void;
}

declare class Keyboard {
    /**
     * Creates a new keyboard.
     */
    constructor(window: Window);
    updateState();
    isKeyDown(charCode: number);
    isKeyPress(charCode: number);
}

declare class Mouse {
    /**
     * Gets the x position of the cursor.
     */
    x: number;
    /**
     * Gets the y position of the cursor.
     */
    y: number;
    constructor(window: Window);
    updateState();
}

declare class SoundBuffer {
    constructor(filepath: string);
}

declare class SoundSource {
    loop: boolean;
    state: string;
    volume: number;
    constructor(buffer: SoundBuffer);
    /**
     * Start playing the sound.
     */
    play();
    pause();
    stop();
}

/**
 * Represents a program written in GLSL (OpenGL Shading Language).
 */
declare class ShaderProgram {
    constructor(graphics: Graphics, path: string);
}

declare class VertexSpecification {
    constructor(graphics: Graphics, elements: string[]);
    setIndexData(data: Int32Array, usage: string);
    setVertexData(data: Float32Array, usage: string);
}

declare class RenderTarget {
    constructor(textures: Texture2D[]);
}

/**
 * High resolution timer.
 */
declare class Timer {
    /**
     * Creates a new Timer.
     */
    constructor();
    /**
     * Gets the elapsed time (in seconds) since the timer was created or reset.
     */
    elapsed(): number;
    /**
     * Resets the elapsed time.
     */
    reset();
}

declare type TextureFilter = "linear" | "nearest";

declare type TextureWrap = "repeat" | "clampToEdge";

declare class Texture2D {
    /** 
     * Returns the unique id. 
     */
    id: number;
    /** 
     * Returns number of channels.
     */
    channels: number;
    height: number;
    width: number;
    filter: TextureFilter;
    wrap: TextureWrap;
    constructor(filepath: string);
    constructor(width: number, height: number);
    /** 
     * Returns the color data.
     */
    getData(): number[];
}

declare class Window {
    /**
     * Gets the graphics.
     */
    graphics: Graphics;
    /**
     * Gets the height in pixels of the window.
     */
    height: number;
    /**
     * Gets the width in pixels of the window.
     */
    width: number;
    /**
     * Creates a new Window.
     * @height Preferred Window height (default: 576).
     * @fullscreen When fullscreen is set the specified width/height is not
     * guaranteed (default: false).
     * @title Title for the Window.
     * @width Preferred Window width (default: 1024).
     */
    constructor(options?: {
        height?: number;
        fullscreen?: boolean;
        title?: string;
        width?: number;
    });
    /**
     * Returns true if the window is closing.
     */
    isClosing(): boolean;
    pollEvents(): void;
    /**
     * Closes the window.
     */
    close(): void;
    /**
     * Sets the title of this window.
     */
    setTitle(title: string): void;
}

declare class TextureFont {
    texture: Texture2D;
    glyphs: GlyphCollection;
    constructor(options: { filename: string, size?: number, chars?: string });
    measureString(text: string): number;
}

/** Collection of glyphs. */
declare interface GlyphCollection {
    /** Returns the glyph of the specified character. */
    [char: string]: Glyph
}

/** Represents a glyph */
declare interface Glyph {
    /** Offset to apply when positioning the glyph. */
    offset: { x: number, y: number };
    /** Advancement to apply when positioning the next glyph in a text. */
    advance: { x: number, y: number };
    /** Source rectangle of the glyph in the texture. */
    source: { x: number, y: number, width: number, height: number };
}