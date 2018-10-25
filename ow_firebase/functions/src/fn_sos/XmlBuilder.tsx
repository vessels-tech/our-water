import * as React from 'react';
import { render } from 'jsx-to-html';
import * as ReactDOMServer from 'react-dom/server';


declare namespace JSX {
  interface IntrinsicElements {
    'hello': any
  }
}

// const Capabilities = (children) => {
//   return <div className="capabilities"></div>
// }

class ServiceIdentification extends React.Component {

  render() {
    return (
      <hello className="ServiceIdentification">
        {this.props.children}
      </hello>
    )
  }
}

export function testTsx() {
  
  // return render(
  //   <xml tag="123" className="Hello World">Hello World</xml>
  // );

  /*
   * In order to get this working properly, we need to go from 
   * JSX -> React Components -> Static Markup -> PostProcessing
   */
  return ReactDOMServer.renderToStaticMarkup(
    <div>
      <ServiceIdentification>
        <div>Hello</div>
      </ServiceIdentification>
    </div>
  ).replace('ows_serviceidentification', 'ows:ServiceIdentification')
}