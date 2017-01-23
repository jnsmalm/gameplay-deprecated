import * as $ from "lib/lib"

let a = new $.Vector3(-6, 0, 0)
let b = new $.Vector3(0, 0, 0)

console.log("lerp vec3", $.Vector3.lerp(a, b, 0.5))
console.log("angle", $.Vector3.angle(a, b))
console.log("lerp num", $.Lerp.number(100, 200, 0.3))