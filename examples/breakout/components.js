function _import(name) {
    var _module = require(name);
    for (var key in _module) {
        this[key] = _module[key];
    }
}

_import('/../../lib/lib.js');

function PaddleControlComponent(keyboard) {
    Component.call(this);
    this.keyboard = keyboard;
}

Utils.extend(PaddleControlComponent, Component);

PaddleControlComponent.prototype.update = function() {
    var speed = 0;
    if (this.keyboard.isKeyDown(Keys.LEFT)) {
        speed = -0.3;
    }
    if (this.keyboard.isKeyDown(Keys.RIGHT)) {
        speed = 0.3;
    }
    var x = this.entity.transform.position.x() + speed;
    x = Math.min(Math.max(x, -8), 8);
    this.entity.transform.position = new Vector3(x, -9.5, 0);
};

module.exports.PaddleControlComponent = PaddleControlComponent;