import { TranslationOrg, TranslationFiles } from "./Types";

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


 export function forTranslationOrg(orgId: TranslationOrg): TranslationFiles {

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