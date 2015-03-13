function Component () {
}

Component.prototype.entity = function (value) {
  if (value) {
    if (this._entity) {
      var name = this.constructor.name.toLowerCase();
      throw new TypeError(
        "Component \'" + name + "\' is owned by another entity");
    }
    this._entity = value;
    return this;
  }
  return this._entity;
};

Component.prototype.update = function () {
};

Component.prototype.draw = function () {
};

exports = Component;