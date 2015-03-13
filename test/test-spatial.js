var Spatial = ko.import("../lib/spatial.js");

var tests = {};

tests.spatial_initial = function (assert) {
  var spatial = new Spatial();
  return assert.equal({ x: 0, y: 0 }, spatial.position()) &&
    assert.equal({ x: 0, y: 0 }, spatial.velocity()) &&
    assert.equal({ x: 0, y: 0 }, spatial.acceleration());
};

tests.spatial_position = function (assert) {
  var spatial = new Spatial();
  var position = { x: 10, y: 10 };
  spatial.position(position);
  return assert.equal(position, spatial.position());
};

tests.spatial_velocity = function () {
  var spatial = new Spatial();
  spatial.velocity({ x: 10, y: 10 });
  var velocity = spatial.velocity();
  return assert.equal({ x: 10, y: 10 }, velocity);
};

tests.spatial_acceleration = function () {
  var spatial = new Spatial();
  spatial.acceleration({ x: 10, y: 10 });
  var acceleration = spatial.acceleration();
  return assert.equal({ x: 10, y: 10 }, acceleration);
};

tests.spatial_rotation = function () {
  var spatial = new Spatial();
  var rotation = 5;
  spatial.rotation(rotation);
  return assert.equal(rotation, spatial.rotation());
};

tests.spatial_scaling = function () {
  var spatial = new Spatial();
  var scaling = { x: 2, y: 2 };
  spatial.scaling(scaling);
  return assert.equal(scaling, spatial.scaling());
};

tests.spatial_update = function () {
  var spatial = new Spatial();
  spatial.acceleration({ x: 8, y: 8 });
  spatial.update(0.5);
  var velocity = spatial.velocity();
  var position = spatial.position();
  return assert.equal({ x: 4, y: 4 }, velocity) &&
    assert.equal({ x: 2, y: 2 }, position);
};

exports = tests;