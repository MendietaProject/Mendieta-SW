const ActivityPointerStorage = require('../storage/activityPointerStorage');
const StorageError = require('../storage/storageError');
const ActivityError = require('./activityError');
const ActivityStorage = require('../storage/activityStorage');

function activityController(app, state) {
  const actPtrStorage = new ActivityPointerStorage('activities');

  app.route('/activities')
    .get(getAll)
    .put(put)

  app.route('/activities/:activityId')
    .get(getById)

  app.route('/activities/current')
    .get(getCurrent)
    .post(postCurrent);

  function getAll(req, res) {
    try {
      res.send(actPtrStorage.getAll());
    } catch (err) {
      handleError(res, err);
    }
  }

  function getById(req, res) {
    try {
      let result = actPtrStorage.getById(req.params.activityId);
      let actStorage = new ActivityStorage(result.id);
      res.send(actStorage.getAll());
    } catch (err) {
      handleError(res, err);
    }
  }

  function put(req, res) {
    try {
      req.body["id"] = actPtrStorage.add()
      let actStorage = new ActivityStorage(req.body.id);
      res.send(actStorage.add(req.body));

    } catch (err) {
      handleError(res, err);
    }
  }

  function getCurrent(req, res) {
    try {
      if (state.currentActivity === undefined) {
        throw new ActivityError("There is no current activity", 404);
      }
      return state.currentActivity;
    } catch (err) {
      handleError(res, err);
    }
  }

  function postCurrent(req, res) {
    let activity = {
      name: req.body.name,
      students: [],
      submissions: []
    };
    state.currentActivity = activity;
    res.send(state.currentActivity)
  }

  function handleError(res, err) {
    res.status(500);
    if (err instanceof StorageError || err instanceof ActivityError)
      res.status(err.statusCode);
    res.send(JSON.stringify(`${err.name}: ${err.message}`));
  }
}

module.exports = activityController;
