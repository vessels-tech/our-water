import { TranslationRowType } from "./parser";
import { TranslationEnum } from "./Types";


function getTemplateStrings(translations: { [index: string]: [string, TranslationRowType] }): string {
  delete translations['language'];
  delete translations['region'];


  const rows = Object.keys(translations).map(key => {
    const [value, type] = translations[key];
    if (type === TranslationRowType.function) {
      //No need for quotes for function based rows
      return `    ${key}: ${value},`
    }
    return `    ${key}: "${value}",`
  });
  return rows.reduce((acc: string, curr: string) => {
    return acc + '\n' + curr;
  },'');
}

export function fileForTranslations(translationEnum: TranslationEnum, translations: {[index: string]: [string, TranslationRowType]} ): string {

  const templateStrings = "hello 123";

  const string = `/**
 * Do not edit this file directly. 
 * Instead, edit the appropriate spreadsheet 
 * https://docs.google.com/spreadsheets/d/102zLqEWj4xlqqNgVUFCiMLqdcvaLY6GntS1xmlHdAE8/edit#gid=0
 * and recompile in order to change these fields
 */

import { TranslationFile } from "../Types";

const ${translationEnum}: TranslationFile = {
  metadata: {
    language: '${translations.language[0]}',
    region: '${translations.region[0]}',
  },
  templates: {${getTemplateStrings(translations)}
  }
}

export {${translationEnum}};
`

  return string;
}