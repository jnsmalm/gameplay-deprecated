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

utils.options = function(options, object) {
    if (typeof options !== 'object') {
        options = {};
    }
    if (options.value !== undefined) {
        throw new TypeError('Could not create options object.');
    }
    options.value = function (name, value) {
        if (options[name] === undefined) {
            if (object) {
                object[name] = value;
            }
            return value;
        }
        if (object) {
            object[name] = options[name];
        }
        return options[name];
    };
    return options;
};

module.exports.Utils = utils;