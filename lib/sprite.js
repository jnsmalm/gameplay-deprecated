var Color = require("color.js").Color;
var Component = require("component.js").Component;
var Vector = require("math.js").Vector;

var Sprite = function (spriteBatch, texture) {
  if (typeof texture === "string") {
    this.texture = new Texture(texture);
  } else {
    this.texture = texture;
  }
  this.position = new Vector();
  this.scaling = new Vector(1, 1);
  this.rotation = 0;
  this.color = Color.white();
  this.visible = true;
  this.origin = new Vector();
  this.spriteBatch = spriteBatch;
};

Sprite.prototype = Object.create(Component.prototype);
Sprite.prototype.constructor = Sprite;

Sprite.prototype.center = function () {
  this.origin.x = this.texture.width / 2;
  this.origin.y = this.texture.height / 2;
};

Sprite.prototype.update = function (elapsed) {
  if (this.animation) {
    this.animation.update(elapsed);
  }
};

Sprite.prototype.draw = function () {
  if (!this.visible) {
    return;
  }
  var options = {
    texture: this.texture,
    position: this.position,
    color: this.color,
    origin: this.origin,
    rotation: this.rotation,
    scaling: this.scaling,
  };
  if (this.animation) {
    options.texture = this.animation.texture();
  }
  if (this.entity) {
    var spatial = this.entity.components.spatial;
    options.position = spatial.position;
    options.rotation = spatial.rotation;
    options.scaling = spatial.scaling;
  }
  this.spriteBatch.draw(options);
};

var SpriteAnimation = function (textures, fps) {
  this.textures = [];
  for (var i = 0; i < textures.length; i++) {
    if (typeof textures[i] === "string") {
      this.textures.push(new Texture(textures[i]));
    } else {
      this.textures.push(textures[i]);
    }
  };
  this.elapsed = 0;
  this.frame = 0;
  this.fps = fps || 20;
};

SpriteAnimation.prototype.update = function (elapsed) {
  this.elapsed += elapsed;
  if (this.elapsed >= 1.0 / this.fps) {
    this.frame = (this.frame + 1) % this.textures.length;
    this.elapsed -= 1.0 / this.fps;
  }
};

SpriteAnimation.prototype.texture = function () {
  return this.textures[this.frame];
};

module.exports.Sprite = Sprite;
module.exports.SpriteAnimation = SpriteAnimation;