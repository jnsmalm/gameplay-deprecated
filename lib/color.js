color = {};

color.rgb = function (r, g, b) {
  return color.rgba(r, g, b, 255);
};

color.rgba = function (r, g, b, a) {
  return {
    r: r / 255,
    g: g / 255,
    b: b / 255,
    a: a / 255,
  };
};

color.aliceBlue = function () { 
  return color.rgb(240, 248, 255);
};

color.white = function () { 
  return color.rgb(255, 255, 255);
};

color.black = function () { 
  return color.rgb(0, 0, 0);
};

color.cornflowerBlue = function () { 
  return color.rgb(100, 149, 237);
};

exports = color;