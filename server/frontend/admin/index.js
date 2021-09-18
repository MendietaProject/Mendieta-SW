

$(document).ready(function () {
  initActivityMaker();
  initActivityChooser();
  connectToServer();
});

function connectToServer() {
  let connectionAttempt = 0;

  function connect() {
    connectionAttempt++;
    return Mendieta.connectToServer()
      .then(() => connectionAttempt = 0);
  }

  function reconnect() {
    let timeout = Math.min(connectionAttempt * 1000, 5000);
    setTimeout(() => connect().catch(reconnect), timeout);
  }

  Mendieta.on("server-disconnect", reconnect);
  return connect().catch(reconnect);
}

function initActivityMaker() {
  // TODO(Richo): Disable form after submission (re-enable on complete) to prevent multiple submissions
  $("#create-activity-form").on("submit", function (e) {
    e.preventDefault();

    // TODO(Richo): Load all the other fields as well!
    let activity = {
      name: $("#activity-name").val()
    };

    Mendieta.createActivity(activity).then(initMainScreen)
  });

  Mendieta.getCurrentActivity()
    .then(initMainScreen)
    .catch(() => $("#activity-selector").show());
}

function initActivityChooser(){
  Mendieta.getAllActivities().then(result => {
    $('#activities-list').html('');
    for(let i=0; i < result.length; i++){
      var button = $('<button type="button" class="list-group-item list-group-item-action">A second item</button>');
      $('#activities-list').append(button);
      button.text(result[i].name);
      button.on('click', () => {
        Mendieta.selectActivity(result[i].id).then(initMainScreen);
      });
    }
  });
}

function initMainScreen(currentActivity) {
  $("#activity-selector").hide();
  $("#main-screen").show();
  document.getElementById("titulo-actividad").innerText = currentActivity.name;
  const table = $('#table_id').DataTable({
    // TODO(Richo): Get the data directly from the websocket and update table manually?
    ajax: {
      url: "/submissions",
      dataSrc:''
    },
    //TODO: I need to store the original index and display it in the datatable
    columns: [
      {"defaultContent": ""},
      {"data" : "state"},
      {"data" : "author.name"},
      {"data" : "program.src"},
      {"defaultContent": "<button data-action='delete'>Cancelar</button>"}
    ],
    responsive: true,
    createdRow: (row, data, index) => {
      row.children[0].innerText = (index + 1).toString();
      row.dataset.id = data.id;
      console.log(row)
    },
  });

  table.on('row-reorder', function (e, details, edit) {
    console.log(details);
  });

  table.on('click', 'button', function () {
    var action = this.dataset.action;
    var data = table.row($(this).parents('tr')).data();
    if (action == "delete") {
      // TODO(Richo): Add some kind of dialog to confirm user action
      Mendieta.cancelSubmission(data.id)
        .then(result => {
          console.log("Succesfully canceled " + result);
          table.ajax.reload();
        });
    }
  });

  Mendieta.on("activity-update", activity => {
    // TODO(Richo): Use activity data to reload the table without going to the server again
    table.ajax.reload();
  });
  Mendieta.on("submission-update", submission => {
    // TODO(Richo): Use the submission data to update the table without going to the server again
    table.ajax.reload();
  })
}

function backToMenu(){
  // TODO(Richo): Add some kind of dialog to confirm user action
  Mendieta.cancelCurrentActivity().finally(() => location.reload());
}
