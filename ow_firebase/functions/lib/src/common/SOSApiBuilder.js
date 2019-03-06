"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function serviceIdentification(node, title, abstract) {
    const open = node.ele('ows:ServiceIdentification');
    open.ele('ows:Title', {}, 'OurWater SOS').up();
    open.ele('ows:Abstract', {}, 'TODO: insert abstract').up();
    open.ele('ows:Keywords').up();
    open.ele('ows:ServiceType', { codeSpace: 'http://opengeospatial.net' }, 'OGC:SOS').up();
    open.ele('ows:ServiceTypeVersion', {}, '2.0.0').up();
    open.up();
}
exports.serviceIdentification = serviceIdentification;
function serviceProvider(node) {
    node.ele('ows:ServiceProvider')
        .ele('ows:ProviderName', {}, 'OurWater, from Vessels Tech').up()
        .ele('ows:ProviderSite', { 'xlink:href': 'https://vesselstech.com' }).up()
        .ele('ows:ServiceContact').up()
        .up();
}
exports.serviceProvider = serviceProvider;
function operationsMetadata(node, children) {
    children.reduce((acc, curr) => {
        curr(acc);
        return acc;
    }, node.ele('ows:OperationsMetadata'));
}
exports.operationsMetadata = operationsMetadata;
function operations(node, name, children) {
    children.reduce((acc, curr) => {
        curr(acc);
        return acc;
    }, node.ele('ows:Operation', { name }));
}
exports.operations = operations;
function dcp(node) {
    node
        .ele('ows:DCP')
        .ele('ows:HTTP')
        .ele('ows:Get', { 'xlink:href': "http://gin.gw-info.net/GinService/sos/gw?" }).up()
        // Are we supporting post?
        .ele('ows:Post', { 'xlink:href': "http://gin.gw-info.net/GinService/sos/gw?" }).up()
        .up()
        .up();
}
exports.dcp = dcp;
var ParameterType;
(function (ParameterType) {
    ParameterType["ANY"] = "ANY";
    ParameterType["MANY"] = "MANY";
})(ParameterType = exports.ParameterType || (exports.ParameterType = {}));
;
function parameters(node, name, params) {
    switch (params.type) {
        case (ParameterType.ANY): {
            node.ele('ows:Parameter', { name })
                .ele('ows:AnyValue').up()
                .up();
            break;
        }
        case (ParameterType.MANY): {
            params.values.reduce((acc, curr) => {
                return acc.ele('ows:Value', {}, curr).up();
            }, node.ele('ows:Parameter', { name }).ele('ows:AllowedValues'));
        }
    }
}
exports.parameters = parameters;
function filterCapabilities(node) {
    node.ele('sos:filterCapabilities')
        .up();
}
exports.filterCapabilities = filterCapabilities;
function contents(node) {
    node.ele('sos:contents')
        .up();
}
exports.contents = contents;
function allowedValues(node, values) {
    const open = node.ele('ows:AllowedValues');
    values.forEach(value => open.ele('ows:Value', {}, value).up());
    open.up();
}
exports.allowedValues = allowedValues;
exports.Point = (time, value) => {
    return {
        'wml2:point': {
            'wml2:MeasurementTVP': {
                'wml2:time': time,
                'wml2:value': value,
            }
        }
    };
};
//# sourceMappingURL=SOSApiBuilder.js.map