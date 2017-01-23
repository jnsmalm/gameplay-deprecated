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
const $ = require("../../lib/lib");
const context_1 = require("./context");
const level_1 = require("./level");
const content_1 = require("./content");
$.Game.init();
content_1.Content.load();
const level = new level_1.Level(new context_1.GraphicsContext());
$.Game.draw = function () {
    level.draw();
};
$.Game.update = function (elapsedTime) {
    level.update(elapsedTime);
};
$.Game.run();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2FtZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImdhbWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1dBb0JXOztBQUVYLG1DQUFrQztBQUNsQyx1Q0FBMkM7QUFDM0MsbUNBQStCO0FBQy9CLHVDQUFtQztBQUVuQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0FBRWQsaUJBQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUVmLE1BQU0sS0FBSyxHQUFHLElBQUksYUFBSyxDQUFDLElBQUkseUJBQWUsRUFBRSxDQUFDLENBQUM7QUFFL0MsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUc7SUFDVixLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDakIsQ0FBQyxDQUFDO0FBRUYsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsVUFBUyxXQUFtQjtJQUN4QyxLQUFLLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQzlCLENBQUMsQ0FBQztBQUVGLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMifQ==