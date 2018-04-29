"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultErrorHandler = function (err, req, res, next) {
    console.log("error", err);
    if (err.status) {
        return res.status(err.status).json(err);
    }
    return res.status(500).json({ status: 500, message: err.message });
};
//# sourceMappingURL=defaultErrorHandler.js.map