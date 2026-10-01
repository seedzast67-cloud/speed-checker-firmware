var P = require("./parser.js"), assert = require("assert");
var A = "รอบที่ 1\nเลน 1 ทีมแดง\nเลน 2 Speed Boy\nเลน 3 ทีมฟ้า\nรอบที่ 2\nเลน 1 Speed Boy\nเลน 2 ทีมเขียว\nเลน 3 ทีมแดง";
var B = "1\tทีมแดง\tSpeed Boy\tทีมฟ้า\n2\tSpeed Boy\tทีมเขียว\tทีมแดง";
var C = "Round 1: L1 ทีมแดง | L2 Speed Boy | L3 ทีมฟ้า\nRound 2: L1 Speed Boy | L2 ทีมเขียว | L3 ทีมแดง";
var D = "Heat 1\n1. ทีมแดง\n2. Speed Boy\n3. ทีมฟ้า\nHeat 2\nSpeed Boy\nทีมเขียว\nทีมแดง";
[A, B, C, D].forEach(function (t, i) {
  var r = P.parse(t), h = P.findTeam(r, "speedboy");
  assert.strictEqual(r.length, 2, "format " + i + " rounds");
  assert.deepStrictEqual(h.map(function (x) { return [x.round, x.lane]; }), [[1, 2], [2, 1]], "format " + i);
  assert.strictEqual(P.allNames(r).length, 4, "format " + i + " names");
});
console.log("all formats ok");
