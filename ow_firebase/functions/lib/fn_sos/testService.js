"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SOSService_1 = require("./SOSService");
const express = require("express");
const soap = require("soap");
const bodyParser = require('body-parser');
const xml = require('fs').readFileSync('./SOSService.wsdl', 'utf8');
const app = express();
//body parser middleware are supported (optional)
// app.use(bodyParser().raw({ type: function () { return true; }, limit: '5mb' }));
app.listen(8001, function () {
    //Note: /wsdl route will be handled by soap module
    //and all other routes & middleware will continue to work
    soap.listen(app, '/wsdl', SOSService_1.default, xml);
    console.log("Check http://localhost:" + 8001 + '/wsdl' + "?wsdl to see if the service is working");
});
//# sourceMappingURL=testService.js.map