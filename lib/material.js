var Utils = require('/utils.js').Utils;
var Component = require('/entity.js').Component;
var mat4 = require('/gl-matrix/mat4.js');
var vec3 = require('/gl-matrix/vec3.js');
var vec4 = require('/gl-matrix/vec4.js');
var Vector3 = require('/matrix.js').Vector3;
var DirectionalLight = require('/light.js').DirectionalLight;
var PointLight = require('/light.js').PointLight;
var SpotLight = require('/light.js').SpotLight;

function Material(shaderProgram) {
    this.shaderProgram = shaderProgram;
}

Material.prototype.apply = function() {
};

Material.prototype.model = function() {
};

Material.setup = function(camera, lights) {
    PhongMaterial.camera(camera);
    PhongMaterial.setupLights(lights);
    TextureMaterial.camera(camera);
};

var _phongShaderProgram;

function PhongMaterial(graphics) {
    if (!_phongShaderProgram) {
        _phongShaderProgram = new ShaderProgram(
            graphics, module.path + 'assets/shaders/basic')
    }
    Material.call(this, _phongShaderProgram);
    this._color = vec3.fromValues(1,1,1);
    this.specularColor = vec3.create();
    this.shininess = 0.5;
    this.texture = null;
}

Utils.extend(PhongMaterial, Material);

PhongMaterial.prototype.apply = function() {
    _phongShaderProgram.materialColor = this._color;
    _phongShaderProgram.materialSpecularColor = this.specularColor;
    _phongShaderProgram.materialShininess = this.shininess;
};

PhongMaterial.prototype.model = function(value) {
    _phongShaderProgram.model = value;
};

PhongMaterial.prototype.color = function(color) {
    if (color === undefined) {
        return this._color;
    }
    vec3.copy(this._color, color);
};

PhongMaterial.camera = function(camera) {
    if (!_phongShaderProgram) {
        return;
    }
    _phongShaderProgram.projection = camera.projection;
    _phongShaderProgram.view = camera.view;
    _phongShaderProgram.cameraPosition = camera.transform.position;
};

PhongMaterial.setupLights = (function() {
    var _position = vec4.create();
    var _color = new Vector3();

    var _setUniform = function(i, name, value) {
        _phongShaderProgram['allLights[' + i + '].' + name] = value;
    };

    var _setupDirectionalLight = function(index, light) {
        var p = light.transform.position;
        vec4.set(_position, p[0], p[1], p[2], 0);
        _setUniform(index, 'position', _position);
        _setUniform(index, 'attenuation', light.attenuation);
        _setUniform(index, 'ambientCoefficient', light.ambientCoefficient);
    };

    var _setupPointLight = function(index, light) {
        var p = light.transform.position;
        vec4.set(_position, p[0], p[1], p[2], 1);
        _setUniform(index, 'position', _position);
        _setUniform(index, 'attenuation', light.attenuation);
        _setUniform(index, 'ambientCoefficient', light.ambientCoefficient);
        _setUniform(index, 'coneAngle', 180);
    };

    var _setupSpotLight = function(index, light) {
        var p = light.transform.position;
        vec4.set(_position, p[0], p[1], p[2], 1);
        _setUniform(index, 'position', _position);
        _setUniform(index, 'attenuation', light.attenuation);
        _setUniform(index, 'ambientCoefficient', light.ambientCoefficient);
        _setUniform(index, 'coneAngle', light.coneAngle);
        _setUniform(index, 'coneDirection', light.coneDirection);
    };

    return function(lights) {
        if (!_phongShaderProgram) {
            return;
        }
        for (var i=0; i<lights.length; i++) {
            // Copy color components (r,g,b) to a vector3. We ignore the alpha
            // channel for the color of the light.
            _color.set(lights[i].color);
            _setUniform(i,'intensities', _color);

            if (lights[i] instanceof DirectionalLight) {
                _setupDirectionalLight(i, lights[i]);
            } else if (lights[i] instanceof PointLight) {
                _setupPointLight(i, lights[i]);
            } else if (lights[i] instanceof SpotLight) {
                _setupSpotLight(i, lights[i]);
            }
        }
        _phongShaderProgram.numLights = lights.length;
    }
})();

var _textureShaderProgram;

function TextureMaterial(graphics) {
    if (!_textureShaderProgram) {
        _textureShaderProgram = new ShaderProgram(
            graphics, module.path + 'assets/shaders/texture');
    }
    Material.call(this, _textureShaderProgram);

    Object.defineProperty(this, 'tiling', {
        set: function(value) {
            _textureShaderProgram.tiling = value;
        }
    });

    Object.defineProperty(this, 'offset', {
        set: function(value) {
            _textureShaderProgram.offset = value;
        }
    });
}

Utils.extend(TextureMaterial, Material);

TextureMaterial.prototype.model = function(value) {
    _textureShaderProgram.model = value;
};

TextureMaterial.camera = function(camera) {
    if (!_textureShaderProgram) {
        return;
    }
    _textureShaderProgram.projection = camera.projection;
    _textureShaderProgram.view = camera.view;
};

module.exports.Material = Material;
module.exports.TextureMaterial = TextureMaterial;
module.exports.PhongMaterial = PhongMaterial;