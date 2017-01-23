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
"use strict";
const math_1 = require("./math");
const utils_1 = require("./utils");
const transform_1 = require("./transform");
const matrix = new utils_1.Pool(math_1.Matrix4, 10);
const vector = new utils_1.Pool(math_1.Vector3, 10);
/**
 * A camera is a device through which the world is viewed.
 */
class Camera {
    /**
     * Creates a new camera.
     */
    constructor(aspect, near = 0.1, far = 1000, fieldOfView = 45, orthographic = false, orthographicSize = 5) {
        this.aspect = aspect;
        this.near = near;
        this.far = far;
        this.fieldOfView = fieldOfView;
        this.orthographic = orthographic;
        this.orthographicSize = orthographicSize;
        this.transform = new transform_1.Transform();
    }
    /**
     * Creates a new camera.
     */
    static createDefault(window, orthographic = false) {
        let camera = new Camera(window.width / window.height, 0.1, 1000, 45, orthographic);
        camera.transform.localPosition.z = 5;
        camera.transform.rotateY(180 * Math.PI / 180);
        return camera;
    }
    /**
     * Returns the projection matrix.
     */
    getProjection(out = new math_1.Matrix4()) {
        if (this.orthographic) {
            var w = this.orthographicSize * this.aspect;
            return math_1.Matrix4.createOrtho(-w, w, -this.orthographicSize, this.orthographicSize, this.near, this.far, out);
        }
        return math_1.Matrix4.createPerspective((Math.PI / 180) * this.fieldOfView, this.aspect, this.near, this.far, out);
    }
    /**
     * Returns the view matrix.
     */
    getView(out = new math_1.Matrix4()) {
        let world = this.transform.getWorldMatrix(matrix.next);
        let position = this.transform.getPosition(vector.next);
        let forward = world.getForward(vector.next);
        let up = world.getUp(vector.next);
        let center = position.add(forward, vector.next);
        return math_1.Matrix4.createLookAt(position, center, up, out);
    }
    /**
     * Returns the view projection matrix.
     */
    getViewProjection(out = new math_1.Matrix4()) {
        let projection = this.getProjection(matrix.next);
        let view = this.getView(matrix.next);
        return projection.multiply(view, out);
    }
}
exports.Camera = Camera;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FtZXJhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY2FtZXJhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztXQW9CVzs7QUFFWCxpQ0FBc0Q7QUFDdEQsbUNBQThCO0FBQzlCLDJDQUF3QztBQUV4QyxNQUFNLE1BQU0sR0FBRyxJQUFJLFlBQUksQ0FBQyxjQUFPLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDckMsTUFBTSxNQUFNLEdBQUcsSUFBSSxZQUFJLENBQUMsY0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBRXJDOztHQUVHO0FBQ0g7SUFFSTs7T0FFRztJQUNILFlBQW1CLE1BQWMsRUFBUyxPQUFPLEdBQUcsRUFBUyxNQUFNLElBQUksRUFDNUQsY0FBYyxFQUFFLEVBQVMsZUFBZSxLQUFLLEVBQzdDLG1CQUFtQixDQUFDO1FBRlosV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQUFTLFNBQUksR0FBSixJQUFJLENBQU07UUFBUyxRQUFHLEdBQUgsR0FBRyxDQUFPO1FBQzVELGdCQUFXLEdBQVgsV0FBVyxDQUFLO1FBQVMsaUJBQVksR0FBWixZQUFZLENBQVE7UUFDN0MscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFJO1FBTnhCLGNBQVMsR0FBRyxJQUFJLHFCQUFTLEVBQUUsQ0FBQztJQU1BLENBQUM7SUFDcEM7O09BRUc7SUFDSCxNQUFNLENBQUMsYUFBYSxDQUFDLE1BQWMsRUFBRSxZQUFZLEdBQUcsS0FBSztRQUNyRCxJQUFJLE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FDbkIsTUFBTSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQy9ELE1BQU0sQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDckMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUM7UUFDOUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztJQUNsQixDQUFDO0lBQ0Q7O09BRUc7SUFDSCxhQUFhLENBQUMsR0FBRyxHQUFHLElBQUksY0FBTyxFQUFFO1FBQzdCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1lBQ3BCLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1lBQzVDLE1BQU0sQ0FBQyxjQUFPLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFDcEQsSUFBSSxDQUFDLGdCQUFnQixFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUN6RCxDQUFDO1FBQ0QsTUFBTSxDQUFDLGNBQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFDL0QsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDL0MsQ0FBQztJQUNEOztPQUVHO0lBQ0gsT0FBTyxDQUFDLEdBQUcsR0FBRyxJQUFJLGNBQU8sRUFBRTtRQUN2QixJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdkQsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3ZELElBQUksT0FBTyxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzVDLElBQUksRUFBRSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xDLElBQUksTUFBTSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNoRCxNQUFNLENBQUMsY0FBTyxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUMzRCxDQUFDO0lBQ0Q7O09BRUc7SUFDSCxpQkFBaUIsQ0FBQyxHQUFHLEdBQUcsSUFBSSxjQUFPLEVBQUU7UUFDakMsSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDakQsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDckMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQzFDLENBQUM7Q0FDSjtBQWpERCx3QkFpREMifQ==