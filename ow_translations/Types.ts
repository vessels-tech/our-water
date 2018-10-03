export enum TranslationEnum {
  en_AU = 'en_AU',
  en_US = 'en_US',
  guj_IN = 'guj_IN',
  hi_IN = 'hi_IN',
  nl_NL = 'nl_NL',
}

export type Language = 'dutch' | 'english' | 'hindi' | 'gujarati'
export type Region = 'australia' | 'india' | 'netherlands' | 'united states'

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

export enum TranslationOrg {
  mywell = 'mywell',
  ggmn = 'ggmn',
}

/**
 * If you add a new file, it must be defined in this here file.
 */
export type TranslationFiles = GGMNTranslationFiles | MyWellTranslationFiles;
export type MyWellTranslationFiles = {
  type: TranslationOrg.mywell,
  'en_AU': TranslationFile,
  'en_US': TranslationFile,
  'guj_IN': TranslationFile,
  'hi_IN': TranslationFile,
}
export type GGMNTranslationFiles = {
  type: TranslationOrg.ggmn,
  'en_AU': TranslationFile,
  'nl_NL': TranslationFile,
}