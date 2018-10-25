"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.testTsx = testTsx;

var React = _interopRequireWildcard(require("react"));

var _jsxToHtml = require("jsx-to-html");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

// import { render, JSXXML } from 'jsx-xml'
// export function testGetCapabilities() {
//   /** @jsx JSXXML */
//   console.log("TEST 123", render);
//   const xml = render(
//     <test x="3">1 + {2} = {3}</test>
//   );
//   console.log(xml) // xml output: <?xml version="1.0"?><test x="3">1 + 2 = 3</test> 
//   return xml;
// }
function testTsx() {
  // return render(
  //   <capabilities version='2.0.0' schemaLocation="12345">
  //     <serviceIdentification>
  //       <title></title>
  //     </serviceIdentification>
  //   </capabilities>
  // );
  return (0, _jsxToHtml.render)(JSXXML("div", {
    className: "hello"
  }, "Hello World"));
}