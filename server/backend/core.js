const { v4: uuid } = require('uuid');
const Queue = require("@richov/js-async-queue");

class Mendieta {
  #currentQueue = new Queue();
  #currentActivityId = null;
  #observers = {
    "activity-update": [],
    "submission-update": [],
  };


  storage = null;
  students = []; // TODO(Richo): Figure out what to do with storage!

  constructor(storage) {
    this.storage = storage;
  }

  async getCurrentActivity() {
    return await this.findActivity(this.#currentActivityId);
  }
  async setCurrentActivity(activity) {
    await this.resetCurrentQueue();

    if (activity == null) {
      this.#currentActivityId = null;
    } else {
      this.#currentActivityId = activity.id;
      if (activity && !await this.findActivity(activity.id)) {
        await this.addActivity(activity);
      }
    }
    await this.#activityUpdate();
  }

  async getSubmissions() {
    if (!this.#currentActivityId) return [];
    return await this.storage.getAllSubmissions(this.#currentActivityId);
  }

  async resetCurrentQueue() {
    (await this.getSubmissions()).forEach(s => {
      if (!s.isFinished()) {
        this.cancelSubmission(s);
      }
    })
  }

  async getAllActivities() {
    return await this.storage.getAllActivities();
  }
  async findActivity(id) {
    return await this.storage.findActivity(id);
  }
  async addActivity(activity) {
    await this.storage.storeActivity(activity);
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
  removeStudent(id) {    
    const student = this.students.find(s => s.id == id);
    if (!student) return;
    this.students = this.students.filter(s => s != student);
  }

  async findSubmission(id) {
    if (this.#currentActivityId == null) {
      throw "No activity set yet!";
    }
    return await this.storage.findSubmission(this.#currentActivityId, id);
  }
  async addSubmission(submission) {
    if (this.#currentActivityId == null) {
      throw "No activity set yet!";
    }
    await this.storage.storeSubmission(this.#currentActivityId, submission);
    this.#currentQueue.put(submission);
    await this.#activityUpdate();
  }
  async activateSubmission(submission) {
    let currentActivity = await this.getCurrentActivity();
    const testDuration = currentActivity.testDuration;
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
  async #activityUpdate() {
    this.#update("activity-update", await this.getCurrentActivity());
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
  testDuration = 60000 * 1.5;

  constructor(name, duration) {
    this.name = name;
    this.testDuration = duration;
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
    console.log(`${new Date().toISOString()} -> Submission ${this.id} is now ${this.state}!`);
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
