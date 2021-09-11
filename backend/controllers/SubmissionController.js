const { Submission } = require("../models.js");
const JSONX = require("../utils/jsonx.js");

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
  static init(app, mendieta) {
    // TODO(Richo): What happens if the current activity is not set yet?

    app.route('/submissions')
      .get(handleError((_, res) => {
        res.send(mendieta.currentActivity.submissions);
      }))
      .post(handleError(({body: {author, program}}, res) => {
        let submission = new Submission(author, JSONX.parse(program));
        mendieta.currentActivity.addSubmission(submission);
        mendieta.currentQueue.put(submission);
        mendieta.update();
        res.send(submission);
      }));

    app.route('/submissions/:id')
      .get(handleError(({params: {id}}, res) => {
        let submission = mendieta.currentActivity.findSubmission(id);
        if (submission) {
          res.send(submission);
        } else {
          res.sendStatus(404);
        }
      }))
      .delete(handleError(({params: {id}}, res) => {
        let submission = mendieta.currentActivity.findSubmission(id);
        if (submission) {
          submission.cancel();
          mendieta.update();
          res.send(submission);
        } else {
          res.sendStatus(404);
        }
      }));
  }
}

module.exports = SubmissionController;
