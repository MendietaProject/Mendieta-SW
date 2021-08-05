
$(document).ready(function () {

  initActivityChooser();

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
  });


  $.ajax({
    url: "/activities/current",
    type: "GET",
    success: function (result) {
      if (result == "") {
        // NO HAY ACTIVIDAD
        $("#activity-selector").show();
      } else {
        initMainScreen(result);
      }
    }
  })
}

// TODO(Richo): Pensar mejor nombre!
function initMainScreen(currentActivity) {
  $("#main-screen").show();
  const table = $('#table_id').DataTable({
    ajax: {
      url: "/work-queue",
      dataSrc:''
    },
    //TODO: I need to store the original index and display it in the datatable
    columns: [
      {"data" : "id"},
      {"data" : "name"},
      {"data" : "members"},
      {"data" : "size"},
      {"defaultContent": "<button class=\"delete\">Borrar</button>"}
    ],
    responsive: true,
    createdRow: (row, data, index) => {
      var name = data.id.toString();
      $(row).addClass(name)
      console.log(row)
    },
  });

  table.on('row-reorder', function (e, details, edit) {
    console.log(details);
  });

  table.on('click', 'button', function () {
    var action = this.className;
    var data = table.row($(this).parents('tr')).data();
    console.log(action);
    console.log(data);

    if(action === 'delete'){ //get data, modify table
      console.log("Numero de ID en la clase: " + data);
      $.ajax({
        url: "/work-queue/" + data.id,
        type: "DELETE",
        success: function(result){
          console.log("Succesfully Deleted " + result);
          table.ajax.reload();
        }
      })
    }
  });
}
