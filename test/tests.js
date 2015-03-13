function run(filename) {
  var tests = ko.import(filename);
  var count = 0;
  for (var test in tests) {
    if (!tests[test](assert)) {
      ko.log("Failed test \'" + test + "\' in \'" + filename + "\'...");
      return false;
    }
    count++;
  }
  ko.log("Tests completed successfully for \'" + filename + "\'...");
  return true;
}

function deepEqual(a, b) {
  if (typeof a === "object" && typeof b === "object") {
    for (var prop in a) {
      if (!deepEqual(a[prop], b[prop])) {
        return false;
      }
    }
    for (prop in b) {
      if (!deepEqual(a[prop], b[prop])) {
        return false;
      }
    }
    return true;
  }
  return a === b;
}

var assert = {};

assert.equal = function (a, b) {
  var prop;
  if (typeof a === "object" && typeof b === "object") {
    if (!deepEqual(a, b)) {
      ko.log("Expected \'" + JSON.stringify(a) + "\' but result was \'" + 
        JSON.stringify(b) + "\'");
      return false;
    }
    return true;
  }
  if (a !== b) {
    ko.log("Expected \'" + a + "\' but result was \'" + b + "\'");
    return false;
  }
  return true;
};

assert.exception = function (func) {
  try {
    func();
  }
  catch (err) {
    return true;
  }
  ko.log("Expected exception never occurred");
  return false;
};

var files = [
  "test-spatial.js",
  "test-entity.js",
  "test-component.js",
  "test-sprite.js",
];

for (var i=0; i< files.length; i++) {
  if (!run(files[i])) {
    break;
  }
}