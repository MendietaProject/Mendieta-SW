const { Submission } = require("../models.js");
const JSONX = require("../utils/jsonx.js");
const { v4: uuid } = require('uuid');

function handleError(fn) {
  return (req, res) => {
    try {
      fn(req, res);
    } catch (err) {
      res.status(err.statusCode || 500);
      res.send(JSON.stringify(`${err.name}: ${err.message}`));
    }
  }
}

class SubmissionController {
  static init(app, server) {
    // TODO(Richo): What happens if the current activity is not set yet?

    app.route('/submissions')
      .get(handleError((_, res) => {
        res.send(server.currentActivity.submissions);
      }))
      .post(handleError(({body: {author, program}}, res) => {
        let submission = new Submission(author, JSONX.parse(program));
        server.currentActivity.addSubmission(submission);
        server.currentQueue.put(submission);
        server.updateClients();
        res.send(submission);
      }));

    app.route('/submissions/:id')
      .get(handleError(({params: {id}}, res) => {
        let submission = server.currentActivity.findSubmission(id);
        if (submission) {
          res.send(submission);
        } else {
          res.sendStatus(404);
        }
      }))
      .delete(handleError(({params: {id}}, res) => {
        let submission = server.currentActivity.findSubmission(id);
        if (submission) {
          submission.cancel();
          server.updateClients();
          res.send(submission);
        } else {
          res.sendStatus(404);
        }
      }));
  }
}

module.exports = SubmissionController;
