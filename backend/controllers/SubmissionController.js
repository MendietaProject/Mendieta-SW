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

function createSubmission({author, program}) {
  // TODO(Richo): Make a Submission class that initializes and validates the data
  let submission = {
    id: uuid(),
    state: "PENDING", // TODO(Richo): Make enum?
    author: author,
    program: JSONX.parse(program),
  };
  // TODO(Richo): With a class this would be much simpler...
  submission.finalizationToken = new Promise(res => {
    submission.cancel = (canceled) => {
      submission.state = "CANCELED";
      res(canceled);
    };
  });
  return submission;
}

class SubmissionController {
  static init(app, server) {
    // TODO(Richo): What happens if the current activity is not set yet?

    app.route('/submissions')
      .get(handleError((_, res) => {
        res.send(server.currentActivity.submissions);
      }))
      .post(handleError(({body}, res) => {
        let submission = createSubmission(body);
        server.currentActivity.submissions.push(submission);
        server.currentQueue.put(submission);
        res.send(submission);
      }));

    app.route('/submissions/:id')
      .get(handleError(({params: {id}}, res) => {
        // TODO(Richo): Find submission method in activity?
        let submissions = server.currentActivity.submissions;
        let submission = submissions.find(s => s.id == id);
        if (submission) {
          res.send(submission);
        } else {
          res.sendStatus(404);
        }
      }))
      .delete(handleError(({params: {id}}, res) => {
        // TODO(Richo): Find submission method in activity?
        let submissions = server.currentActivity.submissions;
        let submission = submissions.find(s => s.id == id);
        if (submission) {
          submission.cancel(true);
          res.send(submission);
        } else {
          res.sendStatus(404);
        }
      }));
  }
}

module.exports = SubmissionController;
