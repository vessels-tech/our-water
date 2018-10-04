import { TranslationOrg, TranslationFiles, TranslationEnum } from "./Types";

import {en_AU} from './common/en_AU';
import {en_US} from './common/en_US';
import {guj_IN} from './common/guj_IN';
import {hi_IN} from './common/hi_IN';
import {test_UPPER} from './common/test_UPPER';


/**
 * This is the root translations file. 
 * 
 * Include this to get the magical translations working.
 * 
 * In this class, we pull in the common translations, and override any
 * values for the given orgId if they exist.
 */
 export function translationsForTranslationOrg(orgId: TranslationOrg): TranslationFiles {
  //TODO: Implement override for a given organisation.
  //This isn't too urgent right now.

  switch (orgId) {
    case TranslationOrg.mywell: {
      return {
        type: TranslationOrg.mywell,
        en_AU,
        en_US,
        guj_IN,
        hi_IN,
        test_UPPER,
      }
    }

    case TranslationOrg.ggmn: {
      return {
        type: TranslationOrg.ggmn,
        en_AU,
        //TODO: fix
        nl_NL: en_AU,
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
        case 'en_AU': return files.en_AU;
        case 'en_US': return files.en_US;
        case 'guj_IN': return files.guj_IN;
        case 'hi_IN': return files.hi_IN;
        case 'test_UPPER': return files.test_UPPER;
        default: {
          throw new Error(`Error with translations. Could not find translation: ${language} for Org: ${files.type}`);
        }
      }
    }
    case (TranslationOrg.ggmn): {
      switch (language) {
        case 'en_AU': return files.en_AU;
        case 'nl_NL': return files.nl_NL;
        default: {
          throw new Error(`Error with translations. Could not find translation: ${language} for Org: ${files.type}`);
        }
      }
    }
  }
}