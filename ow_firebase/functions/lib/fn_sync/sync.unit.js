"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validate_1 = require("./validate");
const Joi = require("joi");
const assert = require("assert");
describe('SyncApi Unit Tests', function () {
    describe('CreateSync', function () {
        it('validates the POST /:orgId method correctly', () => {
            //Arrange
            const input = {
                body: {
                    data: {
                        isOneTime: false,
                        datasource: {
                            type: "FileDatasource",
                            fileUrl: 'file.com',
                            dataType: 'Reading',
                            fileFormat: 'TSV',
                            options: {
                                includesHeadings: true,
                                usesLegacyMyWellIds: true,
                            },
                            selectedDatatypes: [
                                'reading',
                            ]
                        },
                        type: "unknown",
                    }
                }
            };
            //Act
            const result = Joi.validate(input, validate_1.createSyncValidation);
            //Assert
            assert.equal(null, result.error);
        });
        it('fails the validation with an unknown datatype', () => {
            //Arrange
            const input = {
                body: {
                    data: {
                        isOneTime: false,
                        datasource: {
                            type: "FileDatasource",
                            fileUrl: 'file.com',
                            dataType: 'Reading',
                            fileFormat: 'TSV',
                            options: {
                                includesHeadings: true,
                                usesLegacyMyWellIds: true,
                            },
                            selectedDatatypes: [
                                'boobasdasd',
                            ]
                        },
                        type: "unknown",
                    }
                }
            };
            //Act
            const result = Joi.validate(input, validate_1.createSyncValidation);
            //Assert
            const hasError = result.error ? true : false;
            assert.equal(true, hasError);
        });
    });
});
//# sourceMappingURL=sync.unit.js.map