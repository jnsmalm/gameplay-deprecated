var Component = ko.import("../lib/component.js");

var tests = {};

tests.component_entity_already_set = function (assert) {
  var component = new Component();
  component.entity({});
  return assert.exception(function () {
    component.entity({});
  });
};

tests.component_entity = function () {
  var component = new Component();
  var entity = {};
  component.entity(entity);
  return entity == component.entity();
};

exports = tests;