

$(document).ready(function () {

  initActivityChooser();
  chooseActivity();
});


function initActivityChooser() {
  // TODO(Richo): Disable form after submission (re-enable on complete)
  $("#create-activity-form").on("submit", function (e) {
    e.preventDefault();

    let activity = {
      name: $("#activity-name").val()
    };

    $.ajax({
      url: "/activities/current",
      type: "POST",
      data: activity,
      success: function (result) {
        initMainScreen(result);
        $("#activity-selector").hide();
      }
    })
    document.getElementById("titulo-actividad").innerText = activity.name;
  });


  $.ajax({
    url: "/activities/current",
    type: "GET",
    success: function (result) {
      initMainScreen(result);
    },
    error: function () {
      $("#activity-selector").show();
    }
  })
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
    $.ajax({
      url: "/submissions/" + data.id,
      type: action,
      success: function(result){
        console.log("Succesfully canceled " + result);
        table.ajax.reload();
      }
    })
  });
}

function backToMenu(){
  $("#activity-selector").show();
  $("#main-screen").hide();
  $("#table_id").dataTable().fnDestroy();
}

function chooseActivity(){
  $.ajax({
    url: "/activities",
    type: "GET",
    success: function (result) {
      if (result == "") {
        // NO HAY ACTIVIDAD
      } else {
        console.log(result);
        $('#activities-list').html('');
        for(let i=0; i < result.length; i++){
          var button = $('<button type="button" class="list-group-item list-group-item-action">A second item</button>');
          $('#activities-list').append(button);
          button.text(result[i].name);
          button.on('click', () => {
              $.ajax({
                url: "/activities/current",
                type: "POST",
                data: {id: result[i].id},
                success: function (result) {
                  initMainScreen(result);
                  $("#activity-selector").hide();
                }
              })
            }
          );
        }
      }
    }
  })

}

/*function saveActivity(){
  console.log("Hello")
  let activity = {
    name: $("#activity-name").val(),
    description: $("description").val()
  };

  $.ajax({
    url: "/activities",
    type: "POST",
    data: activity,
    success: function (result) {
      initMainScreen(result);
      $("#activity-selector").show();
      $("#main-screen").hide();
    }
  })
  console.log(activity.name)
}*/
