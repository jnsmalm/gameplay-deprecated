module.exports.extend = function(constructor, parent) {
  constructor.prototype = Object.create(parent.prototype);
  constructor.prototype.constructor = constructor;
};