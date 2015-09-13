function _import(name) {
    var _module = require(name);
    for (var key in _module) {
        this[key] = _module[key];
    }
}

_import('/../../lib/lib.js');
_import('/objects.js');

var game = new Game();

var scene = new Scene(game.window);
scene.camera.translate(0,0,-25);

var paddle = new Paddle(game.graphics, game.keyboard, scene);
var ball = new Ball(game.graphics, paddle);

scene.addChild(paddle);
scene.addChild(new LeftWall(game.graphics));
scene.addChild(new RightWall(game.graphics));
scene.addChild(new Roof(game.graphics));
scene.addChild(new Floor(game.graphics));
scene.addChild(new DirectionalLight());

for (var x=0; x<5; x++) {
    for (var y=0; y<4; y++) {
        scene.addChild(new Brick(game.graphics, x * 2.25 - 4.5, y * 1.5 + 3));
    }
}

game.update = function(elapsed) {
    if (game.keyboard.isKeyDown(Keys.ESCAPE)) {
        game.exit();
    }
    if (game.keyboard.isKeyPress(Keys.ENTER)) {
        ball.launch(scene);
    }
    scene.update(elapsed);
    CollisionManager.detectEntityCollisions(ball, scene.children);
};

game.draw = function() {
    scene.draw();
};

game.run();