const uzi = require("./uzi/controller.js");

function timeout(ms) { return new Promise(res => setTimeout(res, ms)); }

let empty_program = {compiled: {"__class__": "UziProgram", "globals": [], "scripts": []}};

async function start(mendieta, port) {
  try {
    await uzi.connect(port);
    await uzi.run(empty_program);
    while (true) {
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

  let submissionTimeout = timeout(submission.testDuration);
  while (!submission.isFinished()) {
    let stateChanged = await Promise.race([submissionTimeout, submission.stateChanged]);
    if (!stateChanged) { // TIMEOUT!
      mendieta.completeSubmission(submission);
    } else if (submission.isRunning()) {
      await uzi.run(submission.program.compiled);
    } else if (submission.isPaused()) {
      await uzi.run(empty_program);
    }
  }

  await uzi.run(empty_program);
}

module.exports = {start: start};
