const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);
const rootRef = admin.database().ref();

/**
 * Cleans the database, removing any tasks that don't meet the requirements of a task.
 */
exports.cleanDatabase = functions.pubsub.topic('clean-database').onPublish((event) => {
  return rootRef.child('events/').once('value').then((users) => {
    users.forEach((user) => {
      console.log('processing user ' + user.key);
      user.forEach((t) => {
        console.log('processing task ' + t.key);
        let task = t.val();
        if(!task.name.length) {
          t.ref.remove();
        }
      });
    });
  });
});

exports.checkTaskOnCreate = functions.database.ref('/events/{uid}/{taskID}').onCreate((event) => {
  checkTask(event, false);
});

exports.checkTaskOnUpdate = functions.database.ref('/events/{uid}/{taskID}').onUpdate((event) => {
  checkTask(event, true);
});

/**
 * Checks each incoming task to make sure that it meets any requirements before letting it be saved.
 */
function checkTask(event, update) {
  let task = event.data.val();
  
  if(!task.name.length) {
    if(update && event.data.previous.exists()) {
      return event.data.ref.set(event.data.previous.val());
    }
    return event.data.ref.remove();
  }
}