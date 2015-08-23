var utils = require('/utils.js');
var Entity = require('/entity.js').Entity;
var mat4 = require('/gl-matrix/mat4.js');
var vec3 = require('/gl-matrix/vec3.js');

function PerspectiveCamera(aspectRatio, fieldOfView, near, far) {
    Entity.call(this);

    // The default setup for the camera is to move it back a little and rotate
    // it, so that the camera is looking at negative z.
    this.translate(0,0,-5);
    this.rotate(0,(Math.PI / 180) * 180,0);

    this.aspectRatio = aspectRatio;
    this.near = near || 1;
    this.far = far || 1000;
    this.fieldOfView = fieldOfView || 45;

    this._view = mat4.create();
    this._projection = mat4.create();
    this._lookAt = vec3.create();
}

utils.extend(PerspectiveCamera, Entity);

PerspectiveCamera.prototype.projection = function() {
    return mat4.perspective(this._projection, (Math.PI / 180)*this.fieldOfView,
        this.aspectRatio, this.near, this.far);
};

PerspectiveCamera.prototype.view = function() {
    vec3.add(this._lookAt, this.position(), this.forward());
    mat4.lookAt(this._view, this.position(), this._lookAt, this.up());
    return this._view;
};

module.exports.PerspectiveCamera = PerspectiveCamera;