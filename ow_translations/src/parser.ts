const fs = require('fs');
import { fileForTranslations } from "./template";
import { TranslationEnum } from "./Types";

/**
 * Parser pulls down the translations from Google sheets, and puts them
 * in the right fields.
 */

const request = require('request-promise-native');

export type SheetsResponse = {
  version: string,
  encoding: string,
  feed: SheetsFeed,
}

export type SheetsFeed = {
  title: string,
  updated: string,
  entry: SheetsRow[],
}

export type SheetsRow = {
  title: {
    type: string,
    "$t": string,
  },
  content: {
    type: string,
    "$t": string,
  },
  gsx$type: {
    $t: TranslationRowType,
  }
  gsx$id: {
    $t: string,
  }
  gsx$enau: {
    $t: string,
  },
  gsx$enus: {
    $t: string,
  },
  gsx$gujin: {
    $t: string,
  },
  gsx$hiin: {
    $t: string,
  },
  gsx$testupper: {
    $t: string,
  },
  gsx$frfr: {
    $t: string,
  },
  gsx$eses: {
    $t: string,
  },
}

export enum TranslationRowType {
  string = 'string',
  function = 'function',
}

export type TranslationRow = {
  id: string,
  type: TranslationRowType,
  en_AU: string,
  en_US: string,
  guj_IN: string,
  hi_IN: string,
  test_UPPER: string,
  fr_FR: string,
  es_ES: string,
}

export type TranslationColumn = {
  [index: string]: [string, TranslationRowType]
}


function writeFile(path:string, contents:string): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, contents, (err: any) => {
      if (err) {
        return reject(err);
      }

      resolve();
    });
  });
}


function run() {
  //https://docs.google.com/spreadsheets/d/e/2PACX-1vSHp6u_WXM18NB9RqPfiaKugHdT_zhHP5NQlZYStzRJfnwFJPlfwTSYtAGJvP1axvhZ8WifYJcE8RAJ/pubhtml
  const sheetsId = "102zLqEWj4xlqqNgVUFCiMLqdcvaLY6GntS1xmlHdAE8"
  const url = `https://spreadsheets.google.com/feeds/list/${sheetsId}/default/public/values?alt=json;`

  var options = {
    method: 'GET',
    url,
    qs: { alt: 'json' },
    headers:
    {
      'Cache-Control': 'no-cache'
    },
    json: true,
  };
  return request(options)
  .then((response: SheetsResponse) => {
    console.log(response.feed.title);
    const perRowTranslations: TranslationRow[] = [];

    response.feed.entry.forEach((r: SheetsRow) => {
      const row: TranslationRow = {
        id: r.title.$t,
        type: r.gsx$type.$t,
        en_AU: r.gsx$enau.$t,
        en_US: r.gsx$enus.$t,
        guj_IN: r.gsx$gujin.$t,
        hi_IN: r.gsx$hiin.$t,
        test_UPPER: r.gsx$testupper.$t,
        fr_FR: r.gsx$frfr.$t,
        es_ES: r.gsx$eses.$t,

      };
      perRowTranslations.push(row);
    });

    //Now that we have the rows, write the files!
    const en_AU: TranslationColumn = {};
    const en_US: TranslationColumn = {};
    const guj_IN: TranslationColumn = {};
    const hi_IN: TranslationColumn = {};
    const fr_FR: TranslationColumn = {};
    const es_ES: TranslationColumn = {};
    const test_UPPER: TranslationColumn = {};
    perRowTranslations.forEach(row => en_AU[row.id] = [row.en_AU, row.type])
    perRowTranslations.forEach(row => en_US[row.id] = [row.en_US, row.type])
    perRowTranslations.forEach(row => guj_IN[row.id] = [row.guj_IN, row.type])
    perRowTranslations.forEach(row => hi_IN[row.id] = [row.hi_IN, row.type])
    perRowTranslations.forEach(row => fr_FR[row.id] = [row.fr_FR, row.type])
    perRowTranslations.forEach(row => es_ES[row.id] = [row.es_ES, row.type])
    perRowTranslations.forEach(row => test_UPPER[row.id] = [row.test_UPPER, row.type])

    const en_AU_file = fileForTranslations(TranslationEnum.en_AU, en_AU);
    const en_US_file = fileForTranslations(TranslationEnum.en_US, en_US);
    const uj_IN_file = fileForTranslations(TranslationEnum.guj_IN, guj_IN);
    const hi_IN_file = fileForTranslations(TranslationEnum.hi_IN, hi_IN);
    const test_UPPER_file = fileForTranslations(TranslationEnum.test_UPPER, test_UPPER);
    const fr_FR_file = fileForTranslations(TranslationEnum.fr_FR, fr_FR);
    const es_ES_file = fileForTranslations(TranslationEnum.es_ES, es_ES);



    return Promise.all([
      writeFile('./src/common/en_AU.ts', en_AU_file),
      writeFile('./src/common/en_US.ts', en_US_file),
      writeFile('./src/common/guj_IN.ts', uj_IN_file),
      writeFile('./src/common/hi_IN.ts', hi_IN_file),
      writeFile('./src/common/test_UPPER.ts', test_UPPER_file),
      writeFile('./src/common/fr_FR.ts', fr_FR_file),
      writeFile('./src/common/es_ES.ts', es_ES_file),
    ]).catch(err => console.error(err))
  })
  .catch((err: any) => console.error(err));
}

run();