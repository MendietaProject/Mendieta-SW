const uzi = require("./controller.js");

function timeout(ms) { return new Promise(res => setTimeout(res, ms)); }

let empty_program = {compiled: {"__class__": "UziProgram", "globals": [], "scripts": []}};

class QueueManager {
  static async start(server) {
    try {
      await uzi.connect("COM4"); // TODO(Richo): Make it configurable...
      await uzi.run(empty_program);
      while (true) { // TODO(Richo): While still connected?
        let submission = await server.currentQueue.take();
        if (submission.state == "PENDING") {
          submission.state = "ACTIVE";
          // TODO(Richo): Notify authors, then wait for confirmation before sending the program to the arduino
          await uzi.run(submission.program);
          server.updateClients();
          // TODO(Richo): The timeout should be configurable by activity
          await Promise.race([timeout(20000), submission.finalizationPromise]);
          if (submission.isCanceled()) {
            // NOTE(Richo): Either the admin or the user canceled the submission while it was active.
            // TODO(Richo): The user cancellation should be done before starting, that way we can distinguish
            // regular completions vs user cancellations. The modal notifying the user that is its turn is not
            // implemented yet. I think it should be presented with the choice to start the program or cancel.
            // If it chooses to cancel then the submission is canceled. If it chooses to start it then the
            // modal should allow for pausing the program or stop it. Pausing should simply send the empty
            // program to the arduino but not change the submission state. Stopping should send the empty
            // program but also change the submission state to completed.
            console.log(`Submission ${submission.id} was CANCELED!`);
          } else if (submission.isCompleted()) {
            // TODO(Richo): The user stopped the program after it was started. This modal is not implemented yet.
            console.log(`Submission ${submission.id} was COMPLETED manually by the user!`);
          } else {
            // NOTE(Richo): If the submission state didn't change it means we got here on timeout
            submission.complete();
            console.log(`Submission ${submission.id} COMPLETED succesfully!`);
          }
          server.updateClients();
          await uzi.run(empty_program);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }}

module.exports = QueueManager;
