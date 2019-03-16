const MyWellResourceTypes = {
  well: [{ name: 'default', parameter: 'default', readings: [], unitOfMeasure: 'm' }],
  raingauge: [{ name: 'default', parameter: 'default', readings: [], unitOfMeasure: 'mm' }],
  quality: [
    { name: 'ph', parameter: 'ph', readings: [], unitOfMeasure: 'pH' },
    { name: 'EC', parameter: 'EC', readings: [], unitOfMeasure: 'µS/cm' },
    { name: 'salinity', parameter: 'salinity', readings: [], unitOfMeasure: 'PPM' },
    { name: 'turbidity', parameter: 'turbidity', readings: [], unitOfMeasure: 'NTU' },
    { name: 'do', parameter: 'do', readings: [], unitOfMeasure: 'mg/L' },
    { name: 'ecoli', parameter: 'ecoli', readings: [], unitOfMeasure: 'cfu/100ml' },
    { name: 'nitrate', parameter: 'nitrate', readings: [], unitOfMeasure: 'mg/L' },
    { name: 'phosphate', parameter: 'phosphate', readings: [], unitOfMeasure: 'mg/L' },
    { name: 'fluoride', parameter: 'fluoride', readings: [], unitOfMeasure: 'mg/L' },
    { name: 'arsenic', parameter: 'arsenic', readings: [], unitOfMeasure: 'mg/L' },
  ],
  checkdam: [{ name: 'default', parameter: 'default', readings: [], unitOfMeasure: 'm' }],


}

export {
  MyWellResourceTypes,
}