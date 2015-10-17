function _import(name) {
    var _module = require(name);
    for (var key in _module) {
        this[key] = _module[key];
    }
}

_import('/../../lib/lib.js');
_import('/components.js');

function Paddle(graphics, keyboard) {
    Entity.call(this);
    var mesh = new Mesh(graphics, new CubeGeometry(),
        new ColorMaterial(graphics, new Vector3(0.3,0,0)));
    this.addComponent(new PaddleControlComponent(keyboard));
    this.addComponent(new BoxColliderComponent());
    this.addComponent(new RigidBodyComponent({
        mass: 0,
        restitution: 1
    }));
    this.addComponent(new MeshComponent(mesh));
    this.transform.translate(0,-9.5,0);
    this.transform.scale(3,1,1);
}

Utils.extend(Paddle, Entity);

function Ball(graphics, paddle) {
    Entity.call(this);
    var self = this;
    var mesh = new Mesh(graphics, new SphereGeometry(2),
        new ColorMaterial(graphics, new Vector3(0.3,0,0)));
    this.addComponent(new RigidBodyComponent({
        mass: 1,
        restitution: 1
    }));
    this.addComponent(new SphereColliderComponent({
        radius: 0.5,
        collisionHandler: function(entity) {
            if (entity instanceof Floor) {
                self.reset(paddle);
            } else if (entity instanceof Brick) {
                entity.destroy();
            }
        }
    }));
    this.addComponent(new MeshComponent(mesh));
    this.reset(paddle);
}

Utils.extend(Ball, Entity);

Ball.prototype.launch = function(scene) {
    if (this.components.rigidbody.enabled) {
        return;
    }
    this.components.rigidbody.enabled = true;
    this.transform.position(this.transform.position()
        .transform(this.transform.parent().world()));
    this.transform.parent(scene);
    this.transform.scale(3,1,1);
    this.components.rigidbody.body.velocity = new Vector3();
    this.components.rigidbody.addImpulse(5,10,0);
};

Ball.prototype.reset = function(paddle) {
    this.components.rigidbody.enabled = false;
    this.transform.position(0,0,0);
    this.transform.translate(0,1.5,0);
    this.transform.scale(1/3,1,1);
    this.transform.parent(paddle);
};

function Brick(graphics, x, y) {
    Entity.call(this);
    var mesh = new Mesh(graphics, new CubeGeometry(),
        new ColorMaterial(graphics, new Vector3(0.2,0.3,0)));
    this.addComponent(new BoxColliderComponent());
    this.addComponent(new RigidBodyComponent({
        mass: 0,
        restitution: 1
    }));
    this.addComponent(new MeshComponent(mesh));
    this.transform.translate(x,y,0);
    this.transform.scale(2,1,1);
}

Utils.extend(Brick, Entity);

Brick.prototype.destroy = function() {
    this.components.boxcollider.enabled = false;
    this.components.mesh.visible = false;
};

function Wall(graphics) {
    Entity.call(this);
    var mesh = new Mesh(graphics, new CubeGeometry(),
        new ColorMaterial(graphics, new Vector3(0.3,0,0)));
    this.addComponent(new BoxColliderComponent());
    this.addComponent(new RigidBodyComponent({
        mass: 0,
        restitution: 1
    }));
    this.addComponent(new MeshComponent(mesh));
}

Utils.extend(Wall, Entity);

function LeftWall(graphics) {
    Wall.call(this, graphics);
    this.transform.translate(-10,0,0);
    this.transform.rotate(0,0,-0.05);
    this.transform.scale(1,20,1);
}

Utils.extend(LeftWall, Wall);

function RightWall(graphics) {
    Wall.call(this, graphics);
    this.transform.translate(10,0,0);
    this.transform.rotate(0,0,0.05);
    this.transform.scale(1,20,1);
}

Utils.extend(RightWall, Wall);

function Roof(graphics) {
    Wall.call(this, graphics);
    this.transform.translate(0,10,0);
    this.transform.scale(24,1,1);
}

Utils.extend(Roof, Wall);

function Floor(graphics) {
    Entity.call(this);
    var mesh = new Mesh(graphics, new CubeGeometry(),
        new ColorMaterial(graphics, new Vector3(1,1,0.8)));
    this.addComponent(new BoxColliderComponent());
    this.addComponent(new RigidBodyComponent({
        mass: 0,
        restitution: 0
    }));
    this.addComponent(new MeshComponent(mesh));
    this.transform.translate(0,-20,0);
    this.transform.scale(50,20,50);
}

Utils.extend(Floor, Entity);

function DirectionalLight() {
    Entity.call(this);
    this.addComponent(new PhongDirectionalLightComponent());
    this.transform.translate(0,0,1);
}

Utils.extend(DirectionalLight, Entity);

function ColorMaterial(graphics, color) {
    PhongMaterial.call(this, graphics);
    this.color(color);
}

Utils.extend(ColorMaterial, PhongMaterial);

module.exports.Paddle = Paddle;
module.exports.LeftWall = LeftWall;
module.exports.RightWall = RightWall;
module.exports.Roof = Roof;
module.exports.Ball = Ball;
module.exports.Brick = Brick;
module.exports.Floor = Floor;
module.exports.DirectionalLight = DirectionalLight;