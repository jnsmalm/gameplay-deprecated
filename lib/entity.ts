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

import { Transform } from "./transform";

/**
 * Base interface for a component attached to an entity.
 */
export interface Component {
    /**
     * Attaches the component to a transform.
     */
    attach?(transform: Transform): void;
    /**
     * Draws the component.
     */
    draw?(): void;
    /**
     * Updates the component.
     * @param elapsedTime Seconds since the last update.
     */
    update?(elapsedTime: number): void;
}

/**
 * Base class for all entities. Used with components to add behavior and visual 
 * appearance.
 */
export class Entity {
    public transform = new Transform();
    public components: Component[] = [];
    /**
     * Adds a component and attaches it to the transform.
     */
    addComponent<T extends Component>(component: T): T {
        this.components.push(component);
        if (component.attach) {
            component.attach(this.transform);
        }
        return component;
    }
    /**
     * Draws the components.
     */
    draw() {
        for (let component of this.components) {
            if (component.draw) {
                component.draw();
            }
        }
    }
    /**
     * Updates the components.
     * @param elapsedTime Seconds since the last update.
     */
    update(elapsedTime: number) {
        for (let component of this.components) {
            if (component.update) {
                component.update(elapsedTime);
            }
        }
    }
}