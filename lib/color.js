function Color(r, g, b, a) {
  this.r = (r || 0) / 255;
  this.g = (g || 0) / 255;
  this.b = (b || 0) / 255;
  this.a = (a || 0) / 255;
};

Color.prototype.set = function (color) {
  this.r = color.r;
  this.g = color.g;
  this.b = color.b;
  this.a = color.a;
};

Color.aliceBlue = function () { 
  return new Color(240, 248, 255, 255);
};

Color.white = function () { 
  return new Color(255, 255, 255, 255);
};

Color.black = function () { 
  return new Color(0, 0, 0, 255);
};

Color.red = function () {
  return new Color(255, 0, 0, 255);
};

Color.green = function () {
  return new Color(0, 255, 0, 255);
};

Color.blue = function () {
  return new Color(0, 0, 255, 255);
};

Color.cornflowerBlue = function () { 
  return new Color(100, 149, 237, 255);
};

module.exports.Color = Color;