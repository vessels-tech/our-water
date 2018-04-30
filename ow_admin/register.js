#!/usr/bin/env node

const fs = require('fs');
const readline = require('readline');
const request = require('request-promise');

const argv = require('yargs')
    .usage('Usage: $0 <command> [options]')
    .command('register', 'register a resource')
    .example('$0 register -f foo -t bar', 'register the resources of type bar in file foo')
    .alias('f', 'file')
    .describe('f', 'Load a file')
    .alias('t', 'type')
    .describe('t', 'The registration type: [resource | village | reading]')
    .alias('b', 'baseUrl')
    .describe('b', 'The baseurl of the mywell server, defaults to "http://docker.local:3000"')
    .alias('a', 'token')
    .describe('a', 'A valid access token for talking to the server')
    .demandOption(['f', 't'])
    .help('h')
    .alias('h', 'help')
    .epilog('copyright 2017')
    .argv;

const baseUrl = argv.baseUrl ? argv.baseUrl : 'http://docker.local:3000';

const getUriForType = (type) => {
  switch (type) {
    case 'resource':
      return 'resources'
    case 'village':
      return 'villages'
    case 'reading':
      return 'readings'
  }
}

const lineReader = readline.createInterface({
  input: fs.createReadStream(argv.file)
});

const registerRequest = (resource, type) => {
  const options = {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    url: `${baseUrl}/api/${getUriForType(type)}`,
    qs: {
      access_token: argv.token,
    },
    body: Object.assign(resource),
    json: true
  };

  return request(options);
}

const data = [];
const errors = [];
lineReader.on('line', (line) => {
  try {
    data.push(JSON.parse(line));
  } catch (e) {
    errors.push(e);
  }
});

lineReader.on('close', function () {
    return Promise.all(data.map(item => {
      return registerRequest(item, argv.type)
        .catch(err => errors.push(err))
    }))
    .then(() => {
      console.log(`Registered ${data.length} ${argv.type}s, with ${errors.length} errors`);
      if (errors.length > 0) {
        console.log("errors:")
        errors.forEach(error => console.log(`\t${error.status}:${error.message}`));
      }
    });
});
