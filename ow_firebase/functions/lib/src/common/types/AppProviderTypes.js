"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ResultType;
(function (ResultType) {
    ResultType["ERROR"] = "ERROR";
    ResultType["SUCCESS"] = "SUCCESS";
})(ResultType = exports.ResultType || (exports.ResultType = {}));
function makeSuccess(result) {
    return {
        type: ResultType.SUCCESS,
        result,
    };
}
exports.makeSuccess = makeSuccess;
function makeError(message) {
    return {
        type: ResultType.ERROR,
        message,
    };
}
exports.makeError = makeError;
//# sourceMappingURL=AppProviderTypes.js.map