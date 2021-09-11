
let Mendieta = (function () {

  let socket = null;
  let currentActivity = null;
  let updateObservers = [];

  function getCurrentActivity() {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: "/activities/current",
        type: "GET",
        success: resolve,
        error: reject
      });
    });
  }

  function createActivity(activity) {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: "/activities/current",
        type: "POST",
        data: activity,
        success: resolve,
        error: reject
      });
    });
  }

  function selectActivity(id) {
    return new Promise((res, rej) => {
      $.ajax({
        url: "/activities/current",
        type: "POST",
        data: {id: id},
        success: res,
        error: rej
      });
    });
  }

  function cancelSubmission(id) {
    return new Promise((res, rej) => {
      $.ajax({
        url: "/submissions/" + id,
        type: "delete",
        success: res,
        error: rej
      });
    });
  }

  function getAllActivities() {
    return new Promise((res, rej) => {
      $.ajax({
        url: "/activities",
        type: "GET",
        success: res,
        error: rej
      })
    });
  }

  function start() {
    let url = "ws://" + location.host + "/updates";
    socket = new WebSocket(url);

    socket.onerror = function (err) {
      console.error(err);
    }
    socket.onopen = function () {
      console.log("OPEN!");
    }
    socket.onmessage = function (msg) {
      currentActivity = JSON.parse(msg.data);
      for (let i = 0; i < updateObservers.length; i++) {
        let fn = updateObservers[i];
        try {
          fn(currentActivity);
        } catch (err) {
          console.error(err);
        }
      }
    }
  }

  function onUpdate(fn) {
    updateObservers.push(fn);
  }

  return {
    getAllActivities: getAllActivities,
    getCurrentActivity: getCurrentActivity,
    createActivity: createActivity,
    selectActivity: selectActivity,
    cancelSubmission: cancelSubmission,
    start: start,
    onUpdate: onUpdate,
  }
})();
