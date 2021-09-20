let Countdown = (function () {

  function formatDuration(durationSeconds) {
    durationSeconds = Math.max(durationSeconds, 0);
    let seconds = Math.floor(durationSeconds % 60);
    let minutes = Math.floor(durationSeconds / 60);
    let hours = Math.floor(durationSeconds / 3600);
    let result = seconds.toString();
    if (seconds < 10) { result = "0" + result; }
    result = minutes + ":" + result;
    if (minutes < 10) { result = "0" + result; }
    if (hours > 0) {
      result = hours + ":" + result;
    }
    return result;
  }

  return {
    on: $element => {
      let timeout = null;

      function start(duration) {
        let begin = Date.now();

        function update() {
          let msRemaining = duration - (Date.now() - begin);
          let secondsRemaining = msRemaining / 1000;
          $element.text(formatDuration(secondsRemaining));
          $element.css("color", secondsRemaining < 10 ? "red" : "inherit");
          timeout = setTimeout(update, 1000);
        }

        stop();
        update();
      }

      function stop() {
        clearTimeout(timeout);
      }

      return {
        start: start,
        stop: stop,
      };
    }
  };
})();
