const { v4: uuid } = require('uuid');
const Queue = require("./utils/queue.js");

class Mendieta {
  #currentQueue = new Queue();
  #currentActivity = null;
  #observers = {
    "activity-update": [],
    "submission-update": [],
  };

  // TODO(Richo): These should probably be handled by the storage
  activities = [];
  students = [];

  get currentActivity() {
    return this.#currentActivity;
  }
  set currentActivity(activity) {
    // TODO(Richo): When changing activity we must reset the current queue!
    this.#currentActivity = activity;
    if (activity && !this.findActivity(activity.id)) {
      this.addActivity(activity);
    }
    this.#activityUpdate();
  }

  get submissions() {
    if (!this.#currentActivity) return [];
    return this.#currentActivity.submissions;
  }

  findActivity(id) {
    return this.activities.find(activity => activity.id == id);
  }
  addActivity(activity) {
    this.activities.push(activity);
  }

  findStudent(id) {
    return this.students.find(student => student.id == id);
  }
  registerStudent(id, name) {
    // NOTE(Richo): If an id is supplied look for the existing student and update
    // its data in place, otherwise create a new register for this student.
    let student = id ? this.findStudent(id) : null;
    if (student) {
      student.name = name;
    } else {
      student = { id: uuid(), name: name };
      this.students.push(student);
    }
    return student;
  }

  findSubmission(id) {
    // TODO(Richo): Throw if no current activity is set yet!
    return this.#currentActivity.findSubmission(id);
  }
  addSubmission(submission) {
    // TODO(Richo): Throw if no current activity is set yet!
    this.#currentActivity.addSubmission(submission);
    this.#currentQueue.put(submission);
    this.#activityUpdate();
  }
  activateSubmission(submission) {
    const testDuration = this.#currentActivity.testDuration;
    this.#submissionUpdateIf(submission, s => s.activate(testDuration));
  }
  pauseSubmission(submission) {
    this.#submissionUpdateIf(submission, s => s.pause());
  }
  startSubmission(submission) {
    this.#submissionUpdateIf(submission, s => s.start());
  }
  stopSubmission(submission) {
    this.#submissionUpdateIf(submission, s => s.stop());
  }
  completeSubmission(submission) {
    this.#submissionUpdateIf(submission, s => s.complete());
  }
  cancelSubmission(submission) {
    this.#submissionUpdateIf(submission, s => s.cancel());
  }

  nextSubmission() {
    return this.#currentQueue.take();
  }

  on(key, fn) {
    let observers = this.#observers[key];
    if (!observers) throw "Invalid update key!";
    observers.push(fn);
  }
  #activityUpdate() {
    this.#update("activity-update", this.#currentActivity);
  }
  #submissionUpdateIf(submission, fn) {
    if (fn(submission)) {
      this.#update("submission-update", submission);
    }
  }
  #update(key, data) {
    this.#observers[key].forEach(fn => {
      try {
        fn(data);
      } catch (err) {
        console.error(err);
      }
    });
  }
}

class Activity {
  id = uuid();
  name;
  testDuration = 60000 * 1.5; // TODO(Richo): Make it configurable!
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
  READY: "READY",
  RUNNING: "RUNNING",
  PAUSED: "PAUSED",
  CANCELED: "CANCELED",
  COMPLETED: "COMPLETED",
};

class Submission {
  id = uuid();
  state = SubmissionState.PENDING;
  author;
  program;

  testBeginTime;
  testDuration;

  stateChanged;
  #stateChangedResolver;

  constructor(author, program) {
    this.author = author;
    this.program = program;

    this.initStateChanged();
  }

  initStateChanged() {
    this.stateChanged = new Promise(resolve => {
      this.#stateChangedResolver = resolve;
    });
  }

  #changeState(state) {
    let resolver = this.#stateChangedResolver;
    this.initStateChanged();
    this.state = state;
    resolver(state);
  }

  activate(testDuration) {
    if (!this.isPending()) return false;
    this.testDuration = testDuration;
    this.testBeginTime = Date.now();
    this.#changeState(SubmissionState.READY);
    return true;
  }
  start() {
    if (!this.isReady() && !this.isPaused()) return false;
    this.#changeState(SubmissionState.RUNNING);
    return true;
  }
  pause() {
    if (!this.isRunning()) return false;
    this.#changeState(SubmissionState.PAUSED);
    return true;
  }
  stop() {
    // NOTE(Richo): Stopping before the program even run once means cancellation, otherwise completion.
    return this.isReady() ?
      this.cancel() :
      this.complete();
  }
  cancel() {
    if (this.isFinished()) return false;
    this.#changeState(SubmissionState.CANCELED);
    return true;
  }
  complete() {
    if (!this.isActive()) return false;
    this.#changeState(SubmissionState.COMPLETED);
    return true;
  }

  isPending() {
    return this.state == SubmissionState.PENDING;
  }
  isReady() {
    return this.state == SubmissionState.READY;
  }
  isRunning() {
    return this.state == SubmissionState.RUNNING;
  }
  isPaused() {
    return this.state == SubmissionState.PAUSED;
  }
  isCanceled() {
    return this.state == SubmissionState.CANCELED;
  }
  isCompleted() {
    return this.state == SubmissionState.COMPLETED;
  }

  isActive() {
    return this.isReady() || this.isRunning() || this.isPaused();
  }
  isFinished() {
    return this.isCompleted() || this.isCanceled();
  }
}

module.exports = {
  Mendieta: Mendieta,
  Activity: Activity,
  Submission: Submission,
  SubmissionState: SubmissionState,
};
