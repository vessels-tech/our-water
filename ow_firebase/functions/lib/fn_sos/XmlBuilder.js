"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const ReactDOMServer = require("react-dom/server");
// const Capabilities = (children) => {
//   return <div className="capabilities"></div>
// }
class ServiceIdentification extends React.Component {
    render() {
        return (React.createElement("hello", { className: "ServiceIdentification" }, this.props.children));
    }
}
function testTsx() {
    // return render(
    //   <xml tag="123" className="Hello World">Hello World</xml>
    // );
    /*
     * In order to get this working properly, we need to go from
     * JSX -> React Components -> Static Markup -> PostProcessing
     */
    return ReactDOMServer.renderToStaticMarkup(React.createElement("div", null,
        React.createElement(ServiceIdentification, null,
            React.createElement("div", null, "Hello")))).replace('ows_serviceidentification', 'ows:ServiceIdentification');
}
exports.testTsx = testTsx;
//# sourceMappingURL=XmlBuilder.js.map