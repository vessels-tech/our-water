import xmlbuilder = require('xmlbuilder');
import { any } from 'prop-types';

type nodeType = xmlbuilder.XMLElementOrXMLNode;

export function serviceIdentification(node: nodeType, title: string, abstract: string) {
  const open = node.ele('ows:ServiceIdentification')
  open.ele('ows:Title', {}, 'OurWater SOS').up()
  open.ele('ows:Abstract', {}, 'TODO: insert abstract').up()
  open.ele('ows:Keywords').up()
  open.ele('ows:ServiceType', { codeSpace: 'http://opengeospatial.net' }, 'OGC:SOS').up()
  open.ele('ows:ServiceTypeVersion', {}, '2.0.0').up()
  open.up();
}

export function serviceProvider(node: nodeType) {
  node.ele('ows:ServiceProvider')
    .ele('ows:ProviderName', {}, 'OurWater, from Vessels Tech').up()
    .ele('ows:ProviderSite', { 'xlink:href': 'https://vesselstech.com' }).up()
    .ele('ows:ServiceContact').up()
  .up()
}

export function operationsMetadata(node: nodeType, children: Array<(nodeType) => void>) {
  children.reduce((acc: nodeType, curr: (nodeType) => void) => {
    curr(acc);
    return acc;
  }, node.ele('ows:OperationsMetadata'));
}

export function operations(node: nodeType, name: string, children: Array<(nodeType) => void>) {
  children.reduce((acc: nodeType, curr: (nodeType) => void) => {
    curr(acc);
    return acc;
  }, node.ele('ows:Operation', {name}));
}

export function dcp(node: nodeType) {
  node
  .ele('ows:DCP')
    .ele('ows:HTTP')
      .ele('ows:Get', { 'xlink:href': "http://gin.gw-info.net/GinService/sos/gw?" }).up()
      // Are we supporting post?
      .ele('ows:Post', { 'xlink:href': "http://gin.gw-info.net/GinService/sos/gw?" }).up()
    .up()
  .up()
}

export enum ParameterType {
  ANY = "ANY",
  MANY = "MANY",
};

export type AnyParameter = {
  type: ParameterType.ANY,
}

export type ManyParameter = {
  type: ParameterType.MANY,
  values: string[],
}

export function parameters(node: nodeType, name: string, params: AnyParameter | ManyParameter) {
  switch(params.type) {
    case (ParameterType.ANY): {
      node.ele('ows:Parameter', { name })
        .ele('ows:AnyValue').up()
        .up()
      
      break;
    }
    case (ParameterType.MANY): {
      params.values.reduce((acc: nodeType, curr: string) => {
        return acc.ele('ows:Value', {}, curr).up();
      }, node.ele('ows:Parameter', { name }).ele('ows:AllowedValues'));
    }
  }
}


export function filterCapabilities(node: nodeType) {
  node.ele('sos:filterCapabilities')
  .up()
}

export function contents(node: nodeType) {
  node.ele('sos:contents')
  .up()
}


export function allowedValues(node: nodeType, values: string[]) {

  const open = node.ele('ows:AllowedValues');
  values.forEach(value => open.ele('ows:Value', {}, value).up())
  open.up();
}


export const Point = (time: string, value:number) => {
  return {
    'wml2:point': {
      'wml2:MeasurementTVP': {
        'wml2:time': time,
        'wml2:value': value,
      }
    }
  }
}