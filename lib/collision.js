/*The MIT License (MIT)

Copyright (c) 2016 Jens Malmborg

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

'use strict';

var Transform = require('/transform.js').Transform;
var Vector3 = require('/math.js').Vector3;

var _delta = new Vector3();
var _extents = new Vector3();
var _diff = new Vector3();
var _axis = new Vector3();
var _closest = new Vector3();
var _edges = [];
for (var i=0; i<9; i++) {
  _edges[i] = new Vector3();
}

class Shape {
  constructor(center, points, radius) {
    this.center = center;
    this.points = points;
    // Radius for the shape is really only used when shape is a circle/sphere.
    this.radius = radius || 0;
  }

  project(axis) {
    var dot = this.points[0].dot(axis);
    var min = dot;
    var max = dot;
    for (var i=0; i<this.points.length; i++) {
      dot = this.points[i].dot(axis);
      min = Math.min(dot, min);
      max = Math.max(dot, max);
    }
    return {
      min: min - this.radius,
      max: max + this.radius
    };
  }
}

class SAT {
  static distance(a, b) {
    if (a.min < b.min) {
      return b.min - a.max;
    } else {
      return a.min - b.max;
    }
  }

  static testAxes(axes, shapeA, shapeB) {
    var result = {
      depth: null,
      vector: new Vector3()
    };
    for (var i=0; i<axes.length; i++) {
      var projA = shapeA.project(axes[i]);
      var projB = shapeB.project(axes[i]);
      var dist = SAT.distance(projA, projB);
      if (dist > 0) {
        return null;
      }
      dist = Math.abs(dist);
      if (!result.depth || (dist < result.depth && dist > 0)) {
        result.depth = dist;
        result.vector.set(axes[i]);
        var d = shapeA.center.sub(shapeB.center);
        if (d.dot(result.vector) < 0) {
          result.vector = result.vector.negate();
        }
      }
    }
    return result;
  }
}

class Collider {
  constructor() {
    this.active = true;
    this.destroyed = false;
  }

  isColliding() {}
  onCollision() {}
}

class BoxCollider extends Collider {
  constructor(size) {
    super();
    this.extents = size.scale(0.5);
    this.transform = new Transform();
    this.points = [];
    for (var i=0; i<8; i++) {
      this.points.push(new Vector3());
    }
    this.normals = [];
    for (var i=0; i<3; i++) {
      this.normals.push(new Vector3());
    }
    this._temp = {
      diff: new Vector3(),
      point: new Vector3()
    };
  }

  update() {
    calculateBoxPointsAndNormals(this);
  }

  closestPointTo(point, result) {
    if (result) {
      result.set(0,0,0);
    }
    point.sub(this.transform.position, _diff);
    var q = result || new Vector3();

    // The extents of the box does not include the scaling of the transform, 
    // that's why we must multiply the extents with the scaling.
    this.extents.multiply(this.transform.scaling, _extents);

    for (var i=0; i<this.normals.length; i++) {
      var dist = _diff.dot(this.normals[i]);
      if (dist > _extents[i]) {
        dist = _extents[i];
      }
      if (dist < -_extents[i]) {
        dist = -_extents[i];
      }
      q.add(this.normals[i].scale(dist), q);
    }
    return q;
  }

  isColliding(collider, mtv) {
    if (collider instanceof BoxCollider) {
      return isBoxCollidingBox(this, collider, mtv);
    }
    if (collider instanceof SphereCollider) {
      return isBoxCollidingSphere(this, collider, mtv);
    }
    return false;
  }
}

class SphereCollider extends Collider {
  constructor(radius) {
    super();
    this.transform = new Transform();
    this.radius = radius;
  }

  isColliding(collider, mtv) {
    if (collider instanceof SphereCollider) {
      return isSphereCollidingSphere(this, collider, mtv);
    }
    if (collider instanceof BoxCollider) {
      return isBoxCollidingSphere(collider, this, mtv);
    }
    return false;
  }
}

class Collision {
  static detect(colliders) {
    var destroyed = [];
    var mtv = new Vector3();
    for (var i=0; i<colliders.length; i++) {
      var a = colliders[i];
      if (a.destroyed) {
        destroyed.push(i);
      }
      if (!a.active || a.destroyed) {
        continue;
      }
      for (var j=i+1; j<colliders.length; j++) {
        var b = colliders[j];
        if (a.isColliding(b, mtv)) {
          a.onCollision(b, mtv);
          b.onCollision(a, mtv.negate(mtv));
        }
      }
    }
    for (var i=destroyed.length-1; i>=0; i--) {
      colliders.splice(destroyed[i], 1);
    }
  }
}

function isBoxCollidingBox(box1, box2, mtv) {
  // The 9 axes are made up of cross products of edges of A and edges of B. 
  // The set of 9 axes formed by the cross products of edges are used to 
  // consider edge on edge collision detection, where there is not a vertex 
  // penetrating the other object.
  for (var i=0; i<3; i++) {
    for (var j=0; j<3; j++) {
      box1.normals[i].cross(box2.normals[j], _edges[i*3+j]);
      _edges[i*3+j].normalize(_edges[i*3+j]);
    }
  }
  var a = new Shape(box1.transform.position, box1.points);
  var b = new Shape(box2.transform.position, box2.points);

  var result = SAT.testAxes(
    box1.normals.concat(box2.normals).concat(_edges), a, b);
  if (!result) {
    return false;
  }
  if (mtv) {
    result.vector.normalize(result.vector);
    result.vector.scale(result.depth * 1.0001, result.vector);
    mtv.set(result.vector);
  }
  return true;
}

function isSphereCollidingSphere(sphere1, sphere2, mtv) {
  // The radius of the sphere does not include the scaling of the transform, 
  // that's why we must multiply the radius with the scaling. We must choose a 
  // single component of the scaling, we choose the 'x' component.
  var radius1 = sphere1.radius * sphere1.transform.scaling[0];
  var radius2 = sphere2.radius * sphere2.transform.scaling[0];
  var sum = radius1 + radius2;

  var isColliding = sphere1.transform.position.squaredDistance(
    sphere2.transform.position) < sum * sum;
  if (!isColliding) {
    return false;
  }
  if (mtv) {
    sphere1.transform.position.sub(sphere2.transform.position, _delta);
    var length = _delta.len();
    _delta.scale((sum-length)/length, mtv);
  }
  return true;
}

function isBoxCollidingSphere(box, sphere, mtv) {
  var center = sphere.transform.position;

  // The radius of the sphere does not include the scaling of the transform, 
  // that's why we must multiply the radius with the scaling. We must choose a 
  // single component of the scaling, we choose the 'x' component.
  var radius = sphere.radius * sphere.transform.scaling[0];

  // When testing box with sphere using SAT, the only axis that needs to
  // be tested goes from center of sphere to closest point on box.
  _closest = box.closestPointTo(center, _closest);
  _closest = _closest.add(box.transform.position, _closest);
  _axis = _closest.sub(center, _axis).normalize(_axis);

  var a = new Shape(box.transform.position, box.points);
  var b = new Shape(center, [center], radius);

  var result = SAT.testAxes([_axis], a, b);
  if (!result) {
      return false;
  }
  if (mtv) {
    result.vector.normalize(result.vector);
    result.vector.scale(result.depth * 1.0001, result.vector);
    mtv.set(result.vector);
  }
  return true;
}

function calculateBoxPointsAndNormals(box) {
  var w = box.transform.world;
  var e = box.extents;

  box.points[0].set(-e[0], e[1],-e[2]);
  box.points[1].set( e[0], e[1],-e[2]);
  box.points[2].set(-e[0],-e[1],-e[2]);
  box.points[3].set( e[0],-e[1],-e[2]);
  box.points[4].set(-e[0], e[1], e[2]);
  box.points[5].set( e[0], e[1], e[2]);
  box.points[6].set(-e[0],-e[1], e[2]);
  box.points[7].set( e[0],-e[1], e[2]);
  for (var i=0; i<8; i++) {
    box.points[i].transform(w, box.points[i]);
  }

  box.normals[0].set(1,0,0);
  box.normals[1].set(0,1,0);
  box.normals[2].set(0,0,1);
  for (var i=0; i<3; i++) {
    box.normals[i].transform(box.transform.rotation, box.normals[i]);
    box.normals[i].normalize(box.normals[i]);
  }
}

module.exports.BoxCollider = BoxCollider;
module.exports.SphereCollider = SphereCollider;
module.exports.Collision = Collision;