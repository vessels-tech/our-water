"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.testTsx = testTsx;

var React = _interopRequireWildcard(require("react"));

var _jsxToHtml = require("jsx-to-html");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function testTsx() {
  return (0, _jsxToHtml.render)(React.createElement("div", {
    className: "Hello World"
  }, "Hello World"));
}