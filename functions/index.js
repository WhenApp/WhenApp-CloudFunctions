const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);
const rootRef = admin.database().ref();

/**
 * Cleans the database, removing any tasks that don't meet the requirements of a task.
 */
exports.cleanDatabase = functions.pubsub.topic('clean-database').onPublish((event) => {
  return rootRef.child('events/').on('child_added', (e) => {
    return e.ref.on('child_added', (t) => {
      let task = t.val();
      if(!task.name.length) {
        return t.ref.remove();
      }
    });
  });
});

/**
 * Checks each incoming task to make sure that it meets any requirements before letting it be saved.
 */
exports.checkTask = functions.database.ref('/events/{uid}/{taskID}').onWrite((event) => {
  if(!event.data.exists()) {
    return;
  }

  let task = event.data.val();
  
  if(!task.name.length) {
    if(event.data.previous.exists()) {
      return event.data.ref.set(event.data.previous.val());
    }
    return event.data.ref.remove();
  }
});