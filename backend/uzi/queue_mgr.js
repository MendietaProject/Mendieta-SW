const uzi = require("./controller.js");

function sleep(ms) { return new Promise(res => setTimeout(res, ms)); }

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
          // TODO(Richo): The sleep should be configurable by activity
          let canceled = await Promise.race([sleep(20000), submission.finalizationToken]);
          if (canceled) {
            console.log(`Submission ${submission.id} was CANCELED!`);
          } else {
            submission.state = "COMPLETED";
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
