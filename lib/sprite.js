var Component = ko.import("component.js");

function Sprite(spriteBatch, texture) {
  this._color = { r: 1, g: 1, b: 1, a: 1 };
  this._origin = { x: 0, y: 0 };
  this.spriteBatch = spriteBatch;
  this.texture = texture;
}

Sprite.prototype = Object.create(Component.prototype);
Sprite.prototype.constructor = Sprite;

Sprite.prototype.color = function (value) {
  if (value) {
    this._color.r = value.r;
    this._color.g = value.g;
    this._color.b = value.b;
    this._color.a = value.a;
    return this;
  }
  return this._color;
};

Sprite.prototype.origin = function (value) {
  if (value) {
    this._origin.x = value.x;
    this._origin.y = value.y;
    return this;
  }
  return this._origin;
};

Sprite.prototype.centerOrigin = function () {
  this.origin({ 
    x: this.texture.width / 2,
    y: this.texture.height / 2,
  });
  return this;
};

Sprite.prototype.draw = function () {
  var spatial = this.entity().component("spatial");
  var options = {
    texture: this.texture,
    position: spatial.position(),
    color: this.color(),
    origin: this.origin(),
    rotation: spatial.rotation(),
    scaling: spatial.scaling(),
  };
  this.spriteBatch.draw(options);
};

exports = Sprite;