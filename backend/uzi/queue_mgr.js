const uzi = require("./controller.js");

function sleep(ms) { return new Promise(res => setTimeout(res, ms)); }
function log(s) { console.log(s); }

class QueueManager {
  static async start(serverState) {
    log("STARTING TO WORK ON THAT QUEUE!");
    while (true) {
      log("NEXT SUBMISSION, PLEASE...");
      let submission = await serverState.currentQueue.take();
      if (submission.state != "PENDING") {
        log("SUBMISSION IS NOT PENDING!");
      } else {
        log("");
        submission.state = "ACTIVE";
        log("SEND PROGRAM TO ARDUINO: " + submission.id);
        log("NOTIFY USERS ACTIVE SUBMISSION: " + submission.id);
        log("SLEEPING FOR 20s...");
        let canceled = await Promise.race([sleep(20000), submission.finalizationToken]);
        if (canceled) {
          log("NOTIFY USERS CANCELED SUBMISSION: " + submission.id);
        } else {
          submission.state = "COMPLETED";
          log("NOTIFY USERS COMPLETED SUBMISSION: " + submission.id);
        }
        log("");
      }
    }
  }
}

module.exports = QueueManager;
