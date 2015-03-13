var Entity = ko.import("../lib/entity.js");
var Component = ko.import("../lib/component.js");

function TestComponent() {
}

TestComponent.prototype = Object.create(Component.prototype);
TestComponent.prototype.constructor = TestComponent;

var tests = {};

tests.entity_add_component = function () {
  var entity = new Entity();
  entity.addComponent(new TestComponent());
  var component = entity.component("testcomponent");
  return component.entity() === entity;
};

tests.entity_has_component = function () {
  var entity = new Entity();
  entity.addComponent(new TestComponent());
  return entity.hasComponent("testcomponent");
};

exports = tests;