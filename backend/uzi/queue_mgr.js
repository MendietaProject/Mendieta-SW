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
      // TODO(Richo): User clicked start button (not implemented yet)
      await uzi.run(submission.program);
      console.log(`${new Date().toISOString()} -> Submission ${submission.id} is now RUNNING!`);
    } else if (submission.isPaused()) {
      // TODO(Richo): User clicked pause button (not implemented yet)
      await uzi.run(empty_program);
      console.log(`${new Date().toISOString()} -> Submission ${submission.id} is now PAUSED!`);
    } else if (submission.isCompleted()) {
      // TODO(Richo): The user stopped the program after it was started. This modal is not implemented yet.
      console.log(`${new Date().toISOString()} -> Submission ${submission.id} was COMPLETED manually by the user!`);
    } else if (submission.isCanceled()) {
      // NOTE(Richo): Either the admin or the user canceled the submission while it was active.
      // TODO(Richo): The user cancellation should be done before starting, that way we can distinguish
      // regular completions vs user cancellations. The modal notifying the user that is its turn is not
      // implemented yet. I think it should be presented with the choice to start the program or cancel.
      // If it chooses to cancel then the submission is canceled. If it chooses to start it then the
      // modal should allow for pausing the program or stop it. Pausing should simply send the empty
      // program to the arduino but not change the submission state. Stopping should send the empty
      // program but also change the submission state to completed.
      console.log(`${new Date().toISOString()} -> Submission ${submission.id} was CANCELED!`);
    }
  }

  await uzi.run(empty_program);
}

module.exports = {start: start};
