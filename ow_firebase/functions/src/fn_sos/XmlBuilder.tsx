// import { render, JSXXML } from 'jsx-xml'

import * as React from 'react';
import { render } from 'jsx-to-html';

// export function testGetCapabilities() {
//   /** @jsx JSXXML */
//   console.log("TEST 123", render);

//   const xml = render(
//     <test x="3">1 + {2} = {3}</test>
//   );
//   console.log(xml) // xml output: <?xml version="1.0"?><test x="3">1 + 2 = 3</test> 

//   return xml;
// }


export function testTsx() {

  // return render(
  //   <capabilities version='2.0.0' schemaLocation="12345">
  //     <serviceIdentification>
  //       <title></title>
  //     </serviceIdentification>
  //   </capabilities>
  // );

  return render(<div className="hello">Hello World</div>);
}