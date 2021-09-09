
let Mendieta = (function () {

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

  function setCurrentActivity(activity) {
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

  function selectExistingActivity(id) {
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

  function cancelActivity(id) {
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

  return {
    getAllActivities: getAllActivities,
    getCurrentActivity: getCurrentActivity,
    setCurrentActivity: setCurrentActivity,
    selectExistingActivity: selectExistingActivity,
    cancelActivity: cancelActivity,
  }
})();
