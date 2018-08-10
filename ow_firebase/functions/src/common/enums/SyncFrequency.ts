export enum SyncFrequency {
  Hourly = 'hourly',
  Daily = 'daily',
  Weekly = 'weekly',
};

export const SyncFrequencyList = Object.keys(SyncFrequency).map(key => SyncFrequency[key]);
