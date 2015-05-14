var Vector = require("math.js").Vector;

function Entity(){
  this.components = {};
};

Entity.prototype.addComponent = function (component) {
  if (component.entity) {
    var name = component.constructor.name.toLowerCase();
    throw new TypeError(
      "Component \'" + name + "\' is owned by another entity");
  }
  component.entity = this;
  var name = component.constructor.name.toLowerCase();
  this.components[name] = component;
};

Entity.prototype.update = function (elapsed) {
  for (var name in this.components) {
    this.components[name].update(elapsed);
  }
};

Entity.prototype.draw = function () {
  for (var name in this.components) {
    this.components[name].draw();
  }
};

function Component() {
  this.entity = null;
};

Component.prototype.update = function () {
};

Component.prototype.draw = function () {
};

function Spatial() {
  this.position = new Vector();
  this.velocity = new Vector();
  this.acceleraton = new Vector();
  this.rotation = new Vector();
  this.scaling = new Vector(1, 1, 1);
}

Spatial.prototype = Object.create(Component.prototype);
Spatial.prototype.constructor = Spatial;

Spatial.prototype.update = function (elapsed) {
  this.velocity.x += this.acceleraton.x * elapsed;
  this.velocity.y += this.acceleraton.y * elapsed;
  this.velocity.z += this.acceleraton.z * elapsed;
  this.position.x += this.velocity.x * elapsed;
  this.position.y += this.velocity.y * elapsed;
  this.position.z += this.velocity.z * elapsed;
};

module.exports.Entity = Entity;
module.exports.Component = Component;
module.exports.Spatial = Spatial;