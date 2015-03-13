var Component = ko.import("component.js");

function Spatial() {
  this._position = { x: 0, y: 0 };
  this._velocity = { x: 0, y: 0 };
  this._acceleraton = { x: 0, y: 0 };
  this._rotation = 0;
  this._scaling = { x: 1, y: 1 };
}

Spatial.prototype = Object.create(Component.prototype);
Spatial.prototype.constructor = Spatial;

Spatial.prototype.position = function (value) {
  if (value) {
    this._position.x = value.x;
    this._position.y = value.y;
    return this;
  }
  return this._position;
};

Spatial.prototype.velocity = function (value) {
  if (value) {
    this._velocity.x = value.x;
    this._velocity.y = value.y;
    return this;
  }
  return this._velocity;
};

Spatial.prototype.acceleration = function (value) {
  if (value) {
    this._acceleraton.x = value.x;
    this._acceleraton.y = value.y;
    return this;
  }
  return this._acceleraton;
};

Spatial.prototype.rotation = function (value) {
  if (value) {
    this._rotation = value;
    return this;
  }
  return this._rotation;
};

Spatial.prototype.scaling = function (value) {
  if (value) {
    this._scaling.x = value.x;
    this._scaling.y = value.y;
    return this;
  }
  return this._scaling;
};

Spatial.prototype.update = function (elapsedTime) {
  this._velocity.x += this._acceleraton.x * elapsedTime;
  this._velocity.y += this._acceleraton.y * elapsedTime;
  this._position.x += this._velocity.x * elapsedTime;
  this._position.y += this._velocity.y * elapsedTime;
};

exports = Spatial;