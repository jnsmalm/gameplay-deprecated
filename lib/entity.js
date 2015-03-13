var Entity = function () {
  this._components = {};
};

Entity.prototype.addComponent = function (component) {
  component.entity(this);
  var name = component.constructor.name.toLowerCase();
  this._components[name] = component;
  return this;
};

Entity.prototype.component = function (component) {
  if (!this._components[component]) {
    throw new TypeError("Component \'" + component + "\' is not available.");
  }
  return this._components[component];
};

Entity.prototype.hasComponent = function (component) {
  if (this._components[component]) {
    return true;
  }
  return false;
};

Entity.prototype.update = function (elapsedTime) {
  for (var c in this._components) {
    this._components[c].update(elapsedTime);
  }
};

Entity.prototype.draw = function () {
  for (var c in this._components) {
    this._components[c].draw();
  }
};

exports = Entity;