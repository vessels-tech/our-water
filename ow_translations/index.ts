export type Language = 'english' | 'hindi' | 'gujarati'
export type Region = 'australia' | 'india' | 'united states'

export type TranslationMetadata = {
  language: Language
  region: Region
  //TODO: add more
}


export type TranslationFile = {
  metadata: TranslationMetadata,
  templates: {
    client_app: string
  }
}