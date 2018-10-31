export const SyncDatatypes = {
  reading: 'Reading',
  resource: 'Resource',
  group: 'Group',
};

export const SyncDatatypeList = Object.keys(SyncDatatypes).map(key => SyncDatatypes[key]);

/**
 * Throw if the given datatype is not in the SyncDatatypes
 */
export const validateDatatype = (datatype: string) => {
  if (SyncDatatypeList.indexOf(datatype) === -1) {
    throw new Error(`Could not find datatype: ${datatype} in SyncDatatypeList.`);
  }
}

export const validateDatatypes = (datatypes: Array<string>) => {
  datatypes.forEach(datatype => validateDatatype(datatype));
}