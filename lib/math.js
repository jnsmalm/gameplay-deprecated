function Vector(x, y, z) {
  this.x = x || 0;
  this.y = y || 0;
  this.z = z || 0;
}

Vector.prototype.set = function (vector) {
  this.x = vector.x;
  this.y = vector.y;
  this.z = vector.z;
};

Vector.prototype.add = function (vector) {
  this.x += vector.x || 0;
  this.y += vector.y || 0;
  this.z += vector.z || 0;
};

module.exports.Vector = Vector;