module.exports.extend = function(constructor, parent) {
  constructor.prototype = Object.create(parent.prototype);
  constructor.prototype.constructor = constructor;
};

var utils = {};

utils.extend = function(constructor, parent) {
  constructor.prototype = Object.create(parent.prototype);
  constructor.prototype.constructor = constructor;
};

utils.toRadians = function(degrees) {
  return degrees * Math.PI / 180;
};

utils.toDegrees = function(radians) {
  return radians * 180 / Math.PI;
};

module.exports.Utils = utils;