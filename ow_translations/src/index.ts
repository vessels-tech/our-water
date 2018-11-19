import { TranslationOrg, TranslationFiles, TranslationEnum, TranslationFile, TranslationOverrideFile } from "./Types";

import {en_AU} from './common/en_AU';
import {en_US} from './common/en_US';
import {guj_IN} from './common/guj_IN';
import {hi_IN} from './common/hi_IN';
import {test_UPPER} from './common/test_UPPER';
import {fr_FR} from './common/fr_FR';
import {es_ES} from './common/es_ES';


import { ggmn_en_AU } from './ggmn/en_AU';
import { ggmn_fr_FR } from './ggmn/fr_FR';
import { ggmn_es_ES } from './ggmn/es_ES';


/**
 * Get a list of the possible Translations for a given org
 */
export function possibleTranslationsForOrg(orgId: TranslationOrg): TranslationEnum[] {
  switch (orgId) {
    case TranslationOrg.mywell: {
      return [
        TranslationEnum.en_AU,
        TranslationEnum.en_US,
        TranslationEnum.guj_IN,
        TranslationEnum.hi_IN,
        //TODO: how to keep only in dev, but not production?
        // TranslationEnum.test_UPPER,
      ]
    }
    case TranslationOrg.ggmn: {
      return [
        TranslationEnum.en_AU,
        // TranslationEnum.test_UPPER,
        TranslationEnum.fr_FR,
        TranslationEnum.es_ES,
      ]
    }
  }
}


/**
 * This is the root translations file. 
 * 
 * Include this to get the magical translations working.
 * 
 * In this class, we pull in the common translations, and override any
 * values for the given orgId if they exist.
 */
 export function translationsForTranslationOrg(orgId: TranslationOrg): TranslationFiles {
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
        en_AU: mergeFiles(en_AU, ggmn_en_AU),
        fr_FR: mergeFiles(fr_FR, ggmn_fr_FR),
        es_ES: mergeFiles(es_ES, ggmn_es_ES),
        test_UPPER,
      }
    }
  }
} 


function mergeFiles(original: TranslationFile, overrideFile: TranslationOverrideFile | null): TranslationFile {
  if (overrideFile === null) {
    return original;
  }

  const newTemplates = Object.assign(original.templates, null, { ...overrideFile.overrides });
  original.templates = newTemplates;

  return original;
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
        case 'test_UPPER': return files.test_UPPER;
        case 'fr_FR': return files.fr_FR;
        case 'es_ES': return files.es_ES;
        default: {
          throw new Error(`Error with translations. Could not find translation: ${language} for Org: ${files.type}`);
        }
      }
    }
  }
}