var Component = require("component.js").Component;
var Vector = require("math.js").Vector;

function BoundingSphere(radius) {
  this.center = new Vector();
  this.radius = radius;
}

BoundingSphere.prototype = Object.create(Component.prototype);
BoundingSphere.prototype.constructor = BoundingSphere;

BoundingSphere.prototype.intersects = function (boundingSphere) {
  var x = this.center.x - boundingSphere.center.x;
  var y = this.center.y - boundingSphere.center.y;
  var dist = x * x + y * y;
  var minDist = this.radius + boundingSphere.radius;
  return dist <= minDist * minDist;
};

BoundingSphere.prototype.update = function () {
  if (!this.entity) {
    return;
  }
  var spatial = this.entity.components.spatial;
  this.center.set(spatial.position);
};

module.exports.BoundingSphere = BoundingSphere;