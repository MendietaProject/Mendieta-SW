const { v4: uuid } = require('uuid');
const Queue = require("./utils/queue.js");

class Mendieta {
  currentQueue = new Queue();
  activities = [];
  currentActivity = null;
  #observers = [];

  onUpdate(fn) {
    this.#observers.push(fn);
  }
  update() {
    this.#observers.forEach(fn => {
      try {
        fn(); // TODO(Richo): What should we send as argument?
      } catch (err) {
        console.error(err);
      }
    });
  }

  findActivity(id) {
    return this.activities.find(activity => activity.id == id);
  }
}

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
  ACTIVE: "ACTIVE",
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

  setActive() {
    if (!this.isPending()) return;
    this.state = SubmissionState.ACTIVE;
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

  isPending() {
    return this.state == SubmissionState.PENDING;
  }
  isCanceled() {
    return this.state == SubmissionState.CANCELED;
  }
  isCompleted() {
    return this.state == SubmissionState.COMPLETED;
  }
}

module.exports = {
  Mendieta: Mendieta,
  Activity: Activity,
  Submission: Submission,
  SubmissionState: SubmissionState,
};
