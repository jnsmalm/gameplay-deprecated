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
    this.invertedMass = this.mass ? 1 / this.mass : 0;
    this.restitution = restitution || 0.2;
    this.drag = 0;
    this.enableGravity = false;
}

RigidBody.prototype.addForce = (function() {
    var _force = new Vector3();

    return function(x, y, z) {
        if (arguments.length === 1) {
            this.force.add(arguments[0], this.force);
        } else {
            _force.set(x,y,z);
            this.force.add(_force, this.force);
        }
    }
})();

RigidBody.prototype.addImpulse = (function() {
    var _impulse = new Vector3();

    return function(x, y, z) {
        if (arguments.length === 1) {
            this.velocity.add(arguments[0], this.velocity);
        } else {
            _impulse.set(x,y,z);
            this.velocity.add(_impulse, this.velocity);
        }
    }
})();

RigidBody.prototype.update = (function() {
    var _gravity = new Vector3();
    var _drag = new Vector3();
    var _force = new Vector3();
    var _velocity = new Vector3();

    return function(dt) {
        if (this.enableGravity) {
            this.addForce(Physics.gravity.scale(this.mass, _gravity));
        }
        if (this.mass) {
            _force = this.force.scale(this.invertedMass * dt, _force);
            this.velocity = this.velocity.add(_force, this.velocity);
        }
        if (this.drag > 0) {
            _drag = this.velocity
                .normalize(_drag)
                .scale(this.drag * dt, _drag);
            this.velocity = this.velocity.sub(_drag);
        }
        _velocity = this.velocity.scale(dt, _velocity);
        this.position = this.position.add(_velocity, this.position);
        this.force.set(0,0,0);
    }
})();

RigidBody.resolveCollision = (function() {
    var _mtvA = new Vector3();
    var _mtvB = new Vector3();
    var _position = new Vector3();
    var _impulse = new Vector3();
    var _impulse1 = new Vector3();
    var _impulse2 = new Vector3();

    return function(entityA, entityB, mtv) {
        if (!entityA.components.rigidbody || !entityB.components.rigidbody) {
            return;
        }
        var bodyA = entityA.components.rigidbody.body;
        var bodyB = entityB.components.rigidbody.body;
        var invMassA = bodyA.invertedMass;
        var invMassB = bodyB.invertedMass;

        if (invMassA + invMassB === 0) {
            // Both bodies have infinite mass
            return;
        }

        // Move out of collision based on mass.
        _mtvA = mtv.scale(invMassA / (invMassA + invMassB), _mtvA);
        entityA.position(entityA.position().add(_mtvA, _position));

        _mtvB = mtv.scale(invMassB / (invMassA + invMassB), _mtvB);
        entityB.position(entityB.position().sub(_mtvB, _position));

        // Impact speed
        var v = bodyA.velocity.sub(bodyB.velocity, _position);
        var vn = v.dot(mtv.normalize(mtv));

        if (vn > 0) {
            // Already moving away from each other.
            return;
        }

        var e = Math.min(bodyA.restitution, bodyB.restitution);

        // Calculate impulse scalar.
        var j = -(1 + e) * vn;
        if (invMassA + invMassB > 0) {
            j /= (invMassA + invMassB);
        }

        // Apply impulse.
        _impulse = mtv.scale(j, _impulse);
        bodyA.addImpulse(_impulse.scale(invMassA, _impulse1));
        bodyB.addImpulse(_impulse.scale(-invMassB, _impulse2));
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