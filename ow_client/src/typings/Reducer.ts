
export type ActionMeta = {
  loading: boolean,
  error: boolean,
  errorMessage: string,
}

export type SyncMeta = {
  loading: boolean,
  //TODO: Add sync states
}

export type SearchResultsMeta = {
  loading: boolean,
  searchQuery: string,
  error: boolean,
  errorMessage: string,
}