const { v4: uuid } = require('uuid');

// TODO(Richo): Make a class Mendieta that handles the state of the server?

class Activity {
  id = uuid();
  name;
  students = [];
  submissions = [];

  constructor(name) {
    this.name = name;
  }

  addSubmission(submission) {
    this.submissions.push(submission);
  }
  findSubmission(id) {
    return this.submissions.find(s => s.id == id);
  }
}

const SubmissionState = {
  PENDING: "PENDING",
  CANCELED: "CANCELED",
  COMPLETED: "COMPLETED",
};

class Submission {
  id = uuid();
  state = SubmissionState.PENDING;
  author;
  program;

  finalizationPromise;
  #finalizationResolve;

  constructor(author, program) {
    this.author = author;
    this.program = program;

    this.finalizationPromise = new Promise(resolve => {
      this.#finalizationResolve = resolve;
    })
  }

  cancel() {
    if (this.isCompleted()) return;
    this.state = SubmissionState.CANCELED;
    this.#finalizationResolve(false);
  }
  complete() {
    if (this.isCompleted()) return;
    this.state = SubmissionState.COMPLETED;
    this.#finalizationResolve(true);
  }

  isCanceled() {
    return this.state == SubmissionState.CANCELED;
  }
  isCompleted() {
    return this.state == SubmissionState.COMPLETED;
  }
}

module.exports = {
  Activity: Activity,
  Submission: Submission,
  SubmissionState: SubmissionState,
};
