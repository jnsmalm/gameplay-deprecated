function Color(r, g, b, a) {
  this.r = r;
  this.g = g;
  this.b = b;
  this.a = a;
};

Color.fromRGBA = function (r, g, b, a) {
  return new Color(r / 255, g / 255, b / 255, a / 255);
};

Color.aliceBlue = function () { 
  return Color.fromRGBA(240, 248, 255, 255);
};

Color.white = function () { 
  return Color.fromRGBA(255, 255, 255, 255);
};

Color.black = function () { 
  return Color.fromRGBA(0, 0, 0, 255);
};

Color.red = function () {
  return Color.fromRGBA(255, 0, 0, 255);
};

Color.green = function () {
  return Color.fromRGBA(0, 255, 0, 255);
};

Color.blue = function () {
  return Color.fromRGBA(0, 0, 255, 255);
};

Color.cornflowerBlue = function () { 
  return Color.fromRGBA(100, 149, 237, 255);
};

module.exports.Color = Color;