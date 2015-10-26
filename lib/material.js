var Utils = require('/utils.js').Utils;
var Component = require('/entity.js').Component;
var mat4 = require('/gl-matrix/mat4.js');
var vec3 = require('/gl-matrix/vec3.js');
var vec4 = require('/gl-matrix/vec4.js');

function Material(shaderProgram) {
    this.shaderProgram = shaderProgram;
}

Material.prototype.apply = function() {
};

Material.prototype.model = function() {
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

var phongMaterialLights = [];

PhongMaterial.addLight = function() {
    if (!_phongShaderProgram) {
        return;
    }
    if (phongMaterialLights.length === 10) {
        throw new TypeError('Max number of lights reached.');
    }
    phongMaterialLights.push(
        new PhongMaterialLight(phongMaterialLights.length));
    _phongShaderProgram.numLights = phongMaterialLights.length;
    return phongMaterialLights[phongMaterialLights.length - 1];
};

PhongMaterial.removeLight = function(light) {
    if (!_phongShaderProgram) {
        return;
    }
    var index = phongMaterialLights.indexOf(light);
    if (index === -1) {
        return;
    }
    phongMaterialLights.split(index, 1);
    for (var i=index; i<phongMaterialLights.length; i++) {
        phongMaterialLights[i].index--;
    }
};

function setPhongLightUniform(i, name, value) {
    _phongShaderProgram['allLights[' + i + '].' + name] = value;
}

PhongMaterial.updateLight = function(light) {
    setPhongLightUniform(light.index, 'position', light.position);
    setPhongLightUniform(light.index, 'intensities', light.intensities);
    setPhongLightUniform(light.index, 'attenuation', light.attenuation);
    setPhongLightUniform(light.index, 'coneAngle', light.coneAngle);
    setPhongLightUniform(light.index, 'coneDirection', light.coneDirection);
    setPhongLightUniform(
        light.index, 'ambientCoefficient', light.ambientCoefficient);
};

function PhongMaterialLight(index) {
    this.position = vec4.create();
    this.intensities = vec3.fromValues(1,1,1);
    this.attenuation = 0.1;
    this.ambientCoefficient = 0.1;
    this.coneAngle = 0;
    this.coneDirection = vec3.create();
    this.index = index;
}

function PhongDirectionalLightComponent(position) {
    Component.call(this);
    this.light = PhongMaterial.addLight();
}

Utils.extend(PhongDirectionalLightComponent, Component);

PhongDirectionalLightComponent.prototype.intensities = function(intensities) {
    if (intensities === undefined) {
        return this.light.intensities;
    }
    vec3.copy(this.light.intensities, intensities);
};

PhongDirectionalLightComponent.prototype.attenuation = function(attenuation) {
    if (attenuation === undefined) {
        return this.light.attenuation;
    }
    this.light.attenuation = attenuation;
};

PhongDirectionalLightComponent.prototype.ambientCoefficient =
    function(ambientCoefficient) {

    if (ambientCoefficient === undefined) {
        return this.light.ambientCoefficient;
    }
    this.light.ambientCoefficient = ambientCoefficient;
};

PhongDirectionalLightComponent.prototype.update = function() {
    var position = this.entity.transform.position;
    vec4.set(this.light.position, position[0], position[1], position[2], 0);
    PhongMaterial.updateLight(this.light);
};

function PhongPointLightComponent(position) {
    Component.call(this);
    this.light = PhongMaterial.addLight();
}

Utils.extend(PhongPointLightComponent, Component);

PhongPointLightComponent.prototype.intensities = function(intensities) {
    if (intensities === undefined) {
        return this.light.intensities;
    }
    vec3.copy(this.light.intensities, intensities);
};

PhongPointLightComponent.prototype.attenuation = function(attenuation) {
    if (attenuation === undefined) {
        return this.light.attenuation;
    }
    this.light.attenuation = attenuation;
};

PhongPointLightComponent.prototype.ambientCoefficient =
    function(ambientCoefficient) {

        if (ambientCoefficient === undefined) {
            return this.light.ambientCoefficient;
        }
        this.light.ambientCoefficient = ambientCoefficient;
    };

PhongPointLightComponent.prototype.update = function() {
    var position = this.entity.position;
    vec4.set(this.light.position, position[0], position[1], position[2], 1);
    PhongMaterial.updateLight(this.light);
};

module.exports.Material = Material;
module.exports.PhongMaterialLight = PhongMaterialLight;
module.exports.PhongDirectionalLightComponent = PhongDirectionalLightComponent;
module.exports.PhongPointLightComponent = PhongPointLightComponent;
module.exports.PhongMaterial = PhongMaterial;
