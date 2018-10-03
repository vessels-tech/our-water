import { TranslationOrg, TranslationFiles, TranslationEnum } from "./Types";

import {
  en_AU,
  en_US,
  guj_IN,
  hi_IN,
  nl_NL,
} from './common';


/**
 * This is the root translations file. 
 * 
 * Include this to get the magical translations working.
 * 
 * In this class, we pull in the common translations, and override any
 * values for the given orgId if they exist.
 */
 export function translationsForTranslationOrg(orgId: TranslationOrg): TranslationFiles {

  //TODO: Implement override

  switch (orgId) {
    case TranslationOrg.mywell: {
      return {
        type: TranslationOrg.mywell,
        en_AU,
        en_US,
        guj_IN,
        hi_IN,
      }
    }

    case TranslationOrg.ggmn: {
      return {
        type: TranslationOrg.ggmn,
        en_AU,
        nl_NL
      }
    }
  }
} 

/**
 * Get the translations for the given user language setting
 * 
 * I'm thinking of a better way to do this with less typing, but at least
 * this method is fully type safe
 */
export function getTranslationForLanguage(files: TranslationFiles, language: TranslationEnum) {
  switch (files.type) {
    case (TranslationOrg.mywell): {
      switch (language) {
        case 'en_AU': return this.translationFiles.en_AU;
        case 'en_US': return this.translationFiles.en_US;
        case 'guj_IN': return this.translationFiles.guj_IN;
        case 'hi_IN': return this.translationFiles.hi_IN;
        default: {
          throw new Error(`Error with translations. Could not find translation: ${language} for Org: ${this.translationFiles.type}`);
        }
      }
    }
    case (TranslationOrg.ggmn): {
      switch (language) {
        case 'en_AU': return this.translationFiles.en_AU;
        case 'nl_NL': return this.translationFiles.nl_NL;
        default: {
          throw new Error(`Error with translations. Could not find translation: ${language} for Org: ${this.translationFiles.type}`);
        }
      }
    }
  }
}