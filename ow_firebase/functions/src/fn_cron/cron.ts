var functions = require('firebase-functions');

exports.hourly_job = functions.pubsub.topic('hourly-tick').onPublish((event) => {
  console.log("This job is ran every hour!");

  //TODO: lookup all syncs that need to be run every hour
  //Trigger new sync runs
});

exports.hourly_job = functions.pubsub.topic('daily-tick').onPublish((event) => {
  console.log("This job is ran every day!")
});

exports.hourly_job = functions.pubsub.topic('weekly-tick').onPublish((event) => {
  console.log("This job is ran every week!")
});