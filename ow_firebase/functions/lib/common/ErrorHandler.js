"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _AppError = _interopRequireDefault(require("./AppError"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _default(err, req, res, next) {
  console.log("error", err);

  if (_typeof(err) === _typeof(_AppError.default)) {
    var appError = err;
    return res.status(appError.statusCode).json({
      status: appError.statusCode,
      message: appError.message
    });
  }

  if (err.status) {
    return res.status(err.status).json(err);
  }

  return res.status(500).json({
    status: 500,
    message: err.message
  });
}