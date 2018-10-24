// import { render, JSXXML } from 'jsx-xml'

const jsxml = require('jsx-xml');


export function testGetCapabilities() {
  /** @jsx JSXXML */

  const xml = jsxml.render(
    <test x="3">1 + {2} = {3}</test>
  );
  console.log(xml) // xml output: <?xml version="1.0"?><test x="3">1 + 2 = 3</test> 

  return xml;
}