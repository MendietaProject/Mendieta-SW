
let Mendieta = (function () {

  let socket = null;
  let observers = {
    "activity-update": [],
    "submission-update": [],
  };

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

  function cancelCurrentActivity() {
    return new Promise((res, rej) => {
      $.ajax({
        url: "/activities/current",
        type: "DELETE",
        success: res,
        error: rej
      });
    });
  }

  function cancelSubmission(id) {
    return new Promise((res, rej) => {
      $.ajax({
        url: "/submissions/" + id + "/cancel",
        type: "POST",
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

  function connectToServer() {
    // TODO(Richo): Handle server disconnect gracefully
    let url = "ws://" + location.host + "/updates";
    socket = new WebSocket(url);

    socket.onerror = function (err) {
      console.error(err);
    }
    socket.onmessage = function (msg) {
      const evt = JSON.parse(msg.data);
      (observers[evt.type] || []).forEach(fn => {
        try {
          fn(evt.data);
        } catch (err) {
          console.error(err);
        }
      });
    }
  }

  function on(key, fn) {
    observers[key].push(fn);
  }

  return {
    getAllActivities: getAllActivities,
    getCurrentActivity: getCurrentActivity,
    createActivity: createActivity,
    selectActivity: selectActivity,
    cancelCurrentActivity: cancelCurrentActivity,
    cancelSubmission: cancelSubmission,
    connectToServer: connectToServer,
    on: on,
  }
})();
