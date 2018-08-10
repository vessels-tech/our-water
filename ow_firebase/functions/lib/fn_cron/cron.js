// var functions = require('firebase-functions');
// exports.hourly_job =
//   functions.pubsub.topic('hourly-tick').onPublish((event) => {
//     console.log("This job is ran every hour!")
//   });
module.exports = (functions, admin) => {
    functions.pubsub.topic('hourly-tick').onPublish((event) => {
        console.log("This job is ran every hour!");
    });
};
//# sourceMappingURL=cron.js.map