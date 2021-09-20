let TurnNotifier = (function () {

  let activeSubmission = null;
  let hidingModal = false; // TODO(Richo): This sucks!
  let countdown = null;

  function updateGUI() {
    let submission = activeSubmission;
    if (!submission) return;

    $("#turn-notifier-start-button").prop("disabled", submission.state == "RUNNING");
    $("#turn-notifier-pause-button").prop("disabled", submission.state != "RUNNING");
    if (submission.state == "READY") {
      $("#turn-notifier-stop-button").hide();
      $("#turn-notifier-cancel-button").show();
    } else {
      $("#turn-notifier-stop-button").show();
      $("#turn-notifier-cancel-button").hide();
    }
  }

  function isActive(submission) {
    return submission.state == "READY" || submission.state == "RUNNING" || submission.state == "PAUSED";
  }

  function isFinished(submission) {
    return submission.state == "COMPLETED" || submission.state == "CANCELED";
  }

  function showModal() {
    if (hidingModal) {
      $('#turn-notifier-modal').one('hidden.bs.modal', function (e) {
        hidingModal = false;
        $("#turn-notifier-modal").modal("show");
      });
    } else {
      $("#turn-notifier-modal").modal("show");
    }
  }

  function hideModal() {
    hidingModal = true;
    $("#turn-notifier-modal").modal("hide");
  }

  function init() {
    countdown = Countdown.on($("#turn-notifier-timer"));

    $("#turn-notifier-start-button").on("click", () => Mendieta.start(activeSubmission));
    $("#turn-notifier-pause-button").on("click", () => Mendieta.pause(activeSubmission));
    $("#turn-notifier-stop-button").on("click", () => Mendieta.stop(activeSubmission));
    $("#turn-notifier-cancel-button").on("click", () => Mendieta.stop(activeSubmission));


    // TODO(Richo): THIS SUCKS! I need to find a more elegant way of working around the async modal transitions.
    // Or maybe just not use a modal...
    $('#turn-notifier-modal').on('hidden.bs.modal', function (e) {
      hidingModal = false;
    });

    Mendieta.on("submission-update", evt => {
      let timestamp = evt.timestamp;
      let submission = evt.data;
      if (isActive(submission)) {
        let previous = activeSubmission;
        activeSubmission = submission;
        if (!previous) {
          countdown.start(submission.testDuration - (timestamp - submission.testBeginTime));
          showModal();
        }
      } else if (isFinished(submission)) {
        // TODO(Richo): If the activeSubmission is not set but we got here then it must mean one of our pending
        // submissions got canceled, should we show a message?
        if (activeSubmission && activeSubmission.id == submission.id) {
          activeSubmission = null;
          hideModal();
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
