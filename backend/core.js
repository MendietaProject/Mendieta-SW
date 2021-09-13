const { v4: uuid } = require('uuid');
const Queue = require("./utils/queue.js");

class Mendieta {
  #currentQueue = new Queue();
  #currentActivity = null;
  #observers = [];

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
    this.update();
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
    this.update();
  }
  activateSubmission(submission) {
    if (submission.activate()) {
      this.update();
    }
  }
  pauseSubmission(submission) {
    if (submission.pause()) {
      this.update();
    }
  }
  startSubmission(submission) {
    if (submission.start()) {
      this.update();
    }
  }
  stopSubmission(submission) {
    if (submission.stop()) {
      this.update();
    }
  }
  completeSubmission(submission) {
    if (submission.complete()) {
      this.update();
    }
  }
  cancelSubmission(submission) {
    if (submission.cancel()) {
      this.update();
    }
  }

  nextSubmission() {
    return this.#currentQueue.take();
  }

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
}

class Activity {
  id = uuid();
  name;
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
  ACTIVE: "ACTIVE", // TODO(Richo): Think of a better name (WAITING_FOR_USER?)
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

  activate() {
    if (!this.isPending()) return false;
    this.#changeState(SubmissionState.ACTIVE);
    return true;
  }
  start() {
    if (!this.isActive() && !this.isPaused()) return false;
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
    return this.isActive() ? this.cancel() : this.complete();
  }
  cancel() {
    if (this.isCompleted() || this.isCanceled()) return false;
    this.#changeState(SubmissionState.CANCELED);
    return true;
  }
  complete() {
    if (!this.isActive() && !this.isRunning() && !this.isPaused()) return false;
    this.#changeState(SubmissionState.COMPLETED);
    return true;
  }

  isPending() {
    return this.state == SubmissionState.PENDING;
  }
  isActive() {
    return this.state == SubmissionState.ACTIVE;
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
