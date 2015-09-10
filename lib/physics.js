/*The MIT License (MIT)

Copyright (c) 2015 Jens Malmborg

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.*/

var Vector3 = require('/matrix.js').Vector3;
var Component = require('/entity.js').Component;
var Utils = require('/utils.js').Utils;

var Physics = {
    gravity: new Vector3(0,-9.81,0)
};

function RigidBody(mass, restitution) {
    this.position = new Vector3();
    this.force = new Vector3();
    this.velocity = new Vector3();
    this.mass = mass === undefined ? 1 : mass;
    this.restitution = restitution || 0.2;
    this.drag = 0.1;
    this.enableGravity = false;
}

RigidBody.prototype.addForce = function(x, y, z) {
    if (arguments.length === 1) {
        this.force = this.force.add(arguments[0]);
    } else {
        this.force = this.force.add(new Vector3(x,y,z));
    }
};

RigidBody.prototype.addImpulse = function(x, y, z) {
    if (arguments.length === 1) {
        this.velocity = this.velocity.add(arguments[0]);
    } else {
        this.velocity = this.velocity.add(new Vector3(x,y,z));
    }
};

RigidBody.prototype.update = function(dt) {
    if (this.enableGravity) {
        this.addForce(Physics.gravity.scale(this.mass));
    }
    if (this.mass) {
        this.velocity = this.velocity.add(
            Vector3.scale(this.force, 1 / this.mass).scale(dt));
    }
    if (this.drag > 0) {
        var drag = this.velocity.normalize().scale(this.drag).scale(dt);
        this.velocity = this.velocity.sub(drag);
    }
    this.position = this.position.add(Vector3.scale(this.velocity, dt));
    this.force.set(0,0,0);
};

RigidBody.resolveCollision = (function() {
    return function(a, b, mtv) {
        if (!a.components.rigidbody || !b.components.rigidbody) {
            return;
        }
        var body1 = a.components.rigidbody.body;
        var body2 = b.components.rigidbody.body;

        var im1 = 0;
        var im2 = 0;

        if (body1.mass) {
            im1 = 1 / body1.mass;
        }
        if (body2.mass) {
            im2 = 1 / body2.mass;
        }

        var mtv1 = mtv.scale(im1 / (im1 + im2));
        a.position(a.position().add(mtv1));

        var mtv2 = mtv.scale(im2 / (im1 + im2));
        b.position(b.position().sub(mtv2));

        // Impact speed
        var v = body1.velocity.sub(body2.velocity);
        var vn = v.dot(mtv.normalize());

        if (vn > 0) {
            // Already moving away from each other
            return;
        }

        var e = Math.min(body1.restitution, body2.restitution);

        // Calculate impulse scalar
        var j = -(1 + e) * vn;
        if (im1 + im2 > 0) {
            j /= (im1 + im2);
        }

        // Apply impulse
        var impulse = mtv.normalize().scale(j);
        body1.addImpulse(impulse.scale(im1));
        body2.addImpulse(impulse.scale(-im2));
    }
})();

function RigidBodyComponent(mass, restitution) {
    Component.call(this);
    this.body = new RigidBody(mass, restitution);
}

Utils.extend(RigidBodyComponent, Component);

RigidBodyComponent.prototype.addForce = function() {
    this.body.addForce(arguments);
};

RigidBodyComponent.prototype.addImpulse = function() {
    this.body.addImpulse(arguments);
};

RigidBodyComponent.prototype.update = function(elapsed) {
    this.body.position.set(this.entity.position());
    this.body.update(elapsed);
    this.entity.position(this.body.position);
};

module.exports.RigidBody = RigidBody;
module.exports.RigidBodyComponent = RigidBodyComponent;
module.exports.Physics = Physics;