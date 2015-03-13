var Spatial = ko.import("../lib/spatial.js");
var Sprite = ko.import("../lib/sprite.js");
var Entity = ko.import("../lib/entity.js");

var tests = {};

tests.sprite_color = function (assert) {
  var sprite = new Sprite();
  var color = { r: 100, g: 110, b: 120, a: 130 };
  sprite.color(color);
  return assert.equal(color, sprite.color());
};

tests.sprite_origin = function (assert) {
  var sprite = new Sprite();
  var origin = { x: 50, y: 50 };
  sprite.origin(origin);
  return assert.equal(origin, sprite.origin());
};

tests.sprite_centerOrigin = function (assert) {
  var sprite = new Sprite();
  sprite.texture = {
    width: 100,
    height: 100,
  };
  sprite.centerOrigin();
  return assert.equal({ x: 50, y: 50 }, sprite.origin());
};

tests.sprite_draw = function (assert) {
  var options = {
    color: { 
      r: 100, 
      g: 110, 
      b: 120, 
      a: 130
    },
    origin: { 
      x: 20, 
      y: 30
    },
    position: { 
      x: 800, 
      y: 600
    },
    scaling: {
      x: 3, 
      y: 5 
    },
    rotation: 3,
  };
  var spatial = new Spatial().position(options.position)
    .rotation(options.rotation).scaling(options.scaling);
  var sprite = new Sprite().color(options.color).origin(options.origin);
  var entity = new Entity().addComponent(spatial).addComponent(sprite);

  var result;

  sprite.spriteBatch = {
    draw: function (options) {
      result = options;
    }
  };

  sprite.draw();

  return assert.equal(options, result);
};

exports = tests;