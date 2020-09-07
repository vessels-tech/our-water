"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyWellResourceTypes = void 0;
const MyWellResourceTypes = {
    well: [{ name: 'default', parameter: 'default', readings: [], unitOfMeasure: 'm' }],
    raingauge: [{ name: 'default', parameter: 'default', readings: [], unitOfMeasure: 'mm' }],
    quality: [
        { name: 'pH', parameter: 'ph', readings: [], unitOfMeasure: 'pH' },
        { name: 'EC', parameter: 'ec', readings: [], unitOfMeasure: 'µS/cm' },
        { name: 'Salinity', parameter: 'salinity', readings: [], unitOfMeasure: 'PPM' },
        { name: 'Turbidity', parameter: 'turbidity', readings: [], unitOfMeasure: 'NTU' },
        { name: 'DO', parameter: 'do', readings: [], unitOfMeasure: 'mg/L' },
        { name: 'Ecoli', parameter: 'ecoli', readings: [], unitOfMeasure: 'cfu/100ml' },
        { name: 'Nitrate', parameter: 'nitrate', readings: [], unitOfMeasure: 'mg/L' },
        { name: 'Phosphate', parameter: 'phosphate', readings: [], unitOfMeasure: 'mg/L' },
        { name: 'Fluoride', parameter: 'fluoride', readings: [], unitOfMeasure: 'mg/L' },
        { name: 'Arsenic', parameter: 'arsenic', readings: [], unitOfMeasure: 'mg/L' },
    ],
    checkdam: [{ name: 'default', parameter: 'default', readings: [], unitOfMeasure: 'm' }],
};
exports.MyWellResourceTypes = MyWellResourceTypes;
//# sourceMappingURL=mywellConfig.js.map