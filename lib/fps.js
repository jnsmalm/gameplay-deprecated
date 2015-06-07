var Component = require("component.js").Component;

function FpsComponent(window) {
    this.elapsed = 0;
    this.fps = 0;
    this.frames = 0;
    /*this.spriteBatch = new SpriteBatch(window);
    this.font = new SpriteFont({
        chars: "0123456789",
        filename: "sunshine.ttf",
        size: 50
    });*/
}

FpsComponent.prototype = Object.create(Component.prototype);
FpsComponent.prototype.constructor = FpsComponent;

FpsComponent.prototype.update = function (elapsed) {
    this.elapsed += elapsed;
    if (this.elapsed > 1) {
        this.elapsed -= 1;
        this.fps = this.frames;
        this.frames = 0;
        console.log('fps: ' + this.fps);
    }
};

FpsComponent.prototype.draw = function () {
    this.frames++;
    /*this.spriteBatch.begin();
    this.spriteBatch.drawString({
        position: { x: 10, y: 50 },
        font: this.font,
        text: "" + this.fps,
    });
    this.spriteBatch.end();*/
};

module.exports.FpsComponent = FpsComponent;
