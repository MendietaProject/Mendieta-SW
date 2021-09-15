const uzi = require("./controller.js");

function timeout(ms) { return new Promise(res => setTimeout(res, ms)); }

let empty_program = {compiled: {"__class__": "UziProgram", "globals": [], "scripts": []}};

async function start(mendieta) {
  try {
    await uzi.connect("COM4"); // TODO(Richo): Make it configurable...
    await uzi.run(empty_program);
    while (true) { // TODO(Richo): While still connected?
      let submission = await mendieta.nextSubmission();
      if (submission.isPending()) {
        await processSubmission(submission, mendieta);
      }
    }
  } catch (err) {
    console.error(err);
  }
}

async function processSubmission(submission, mendieta) {
  mendieta.activateSubmission(submission);
  console.log(`${new Date().toISOString()} -> Submission ${submission.id} is now WAITING!`);

  let submissionTimeout = timeout(submission.testDuration);
  while (!submission.isFinished()) {
    let state = await Promise.race([submissionTimeout, submission.stateChanged]);
    if (!state) {
      // NOTE(Richo): TIMEOUT! If the submission state didn't change it means we got here on timeout
      mendieta.completeSubmission(submission);
      console.log(`${new Date().toISOString()} -> Submission ${submission.id} COMPLETED succesfully!`);
    } else if (submission.isRunning()) {
      await uzi.run(submission.program);
      console.log(`${new Date().toISOString()} -> Submission ${submission.id} is now RUNNING!`);
    } else if (submission.isPaused()) {
      await uzi.run(empty_program);
      console.log(`${new Date().toISOString()} -> Submission ${submission.id} is now PAUSED!`);
    } else if (submission.isCompleted()) {
      console.log(`${new Date().toISOString()} -> Submission ${submission.id} was COMPLETED manually by the user!`);
    } else if (submission.isCanceled()) {
      console.log(`${new Date().toISOString()} -> Submission ${submission.id} was CANCELED!`);
    }
  }

  await uzi.run(empty_program);
}

module.exports = {start: start};
