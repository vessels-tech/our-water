/**
 * Parser pulls down the translations from Google sheets, and puts them
 * in the right fields.
 */

import * as request from 'request-promise-native';

async function run() {
  //https://docs.google.com/spreadsheets/d/e/2PACX-1vSHp6u_WXM18NB9RqPfiaKugHdT_zhHP5NQlZYStzRJfnwFJPlfwTSYtAGJvP1axvhZ8WifYJcE8RAJ/pubhtml
  const sheetsId = "102zLqEWj4xlqqNgVUFCiMLqdcvaLY6GntS1xmlHdAE8"
  const googleSheetsUrl = `https://spreadsheets.google.com/feeds/list/${sheetsId}/default/public/values?alt=json;`

  console.log("Getting sheet from url: ", googleSheetsUrl);
  const response = await request(sheetsId);
  console.log("response");

}

run();