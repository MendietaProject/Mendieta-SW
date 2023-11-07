let TurnNotifier = (function () {

  let activeSubmission = null;
  let countdown = null;

  function updateGUI() {
    let submission = activeSubmission;
    if (!submission) return;

    $("#turn-notifier-start-button").prop("disabled", submission.state == "RUNNING");
    $("#turn-notifier-pause-button").prop("disabled", submission.state != "RUNNING");
    $("#turn-notifier-stop-button").show();
  }

  function isActive(submission) {
    return submission.state == "READY" || submission.state == "RUNNING" || submission.state == "PAUSED";
  }

  function isFinished(submission) {
    return submission.state == "COMPLETED" || submission.state == "CANCELED";
  }

  function show() {
    $("#turn-notifier").show();
    $("#submit-button").hide();
  }

  function hide() {
    $("#turn-notifier").hide();
    $("#submit-button").show();
  }

  function init() {
    hide();
    countdown = Countdown.on($("#turn-notifier-timer"));

    $("#turn-notifier-start-button").on("click", () => Mendieta.start(activeSubmission));
    $("#turn-notifier-pause-button").on("click", () => Mendieta.pause(activeSubmission));
    $("#turn-notifier-stop-button").on("click", () => Mendieta.stop(activeSubmission));

    Mendieta.on("submission-update", evt => {
      let timestamp = evt.timestamp;
      let submission = evt.data;
      if (isActive(submission)) {
        let previous = activeSubmission;
        activeSubmission = submission;
        if (!previous) {
          countdown.start(submission.testDuration - (timestamp - submission.testBeginTime));
          show();
        }
      } else if (isFinished(submission)) {
        // TODO(Richo): If the activeSubmission is not set but we got here then it must mean one of our pending
        // submissions got canceled, should we show a message?
        if (activeSubmission && activeSubmission.id == submission.id) {
          activeSubmission = null;
          hide();
          countdown.stop();
        }
      }
      updateGUI();
    });
  }

  return {
    init: init,
  }
})();
