"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Joi = require('joi');
exports.validation = {
    query: {
        name: Joi.string().required(),
    }
};
//# sourceMappingURL=validate.js.map