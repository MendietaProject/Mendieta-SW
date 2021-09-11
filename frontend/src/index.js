

$(document).ready(function () {
  initActivityMaker();
  initActivityChooser();
  Mendieta.start();
});

function initActivityMaker() {
  // TODO(Richo): Disable form after submission (re-enable on complete)
  $("#create-activity-form").on("submit", function (e) {
    e.preventDefault();

    let activity = {
      name: $("#activity-name").val()
    };

    Mendieta.createActivity(activity).then(result => {
      initMainScreen(result);
      $("#activity-selector").hide();
    })
    document.getElementById("titulo-actividad").innerText = activity.name;
  });

  Mendieta.getCurrentActivity()
    .then(initMainScreen)
    .catch(() => $("#activity-selector").show());
}

function initActivityChooser(){
  Mendieta.getAllActivities().then(result => {
    console.log(result);
    $('#activities-list').html('');
    for(let i=0; i < result.length; i++){
      var button = $('<button type="button" class="list-group-item list-group-item-action">A second item</button>');
      $('#activities-list').append(button);
      button.text(result[i].name);
      button.on('click', () => {
        Mendieta.selectActivity(result[i].id)
          .then(result => {
            initMainScreen(result);
            $("#activity-selector").hide();
          });
        });
    }
  });
}

// TODO(Richo): Pensar mejor nombre!
function initMainScreen(currentActivity) {
  $("#main-screen").show();
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
      Mendieta.cancelSubmission(data.id)
        .then(result => {
          console.log("Succesfully canceled " + result);
          table.ajax.reload();
        });
    }
  });

  Mendieta.onUpdate((currentActivity) => {
    // TODO(Richo): Use currentActivity to reload the table data without going to the server again
    table.ajax.reload();
  });
}

function backToMenu(){
  // TODO(Richo): Add some kind of dialog to confirm user action
  Mendieta.cancelCurrentActivity().then(() => location.reload());
}
