function buildButtons(){
    /*let button = $("<button>");
    button.text("Borrar");
    return button;*/
    let button = $("<button>Borrar</button>")
    return button;
}

$(document).ready( function () {
    var table = $('#table_id').DataTable({
        "ajax": {url:"http://localhost:3000/work-queue",
         dataSrc:''
    },
        /*rowReorder:{
            dataSrc: "name"
        },*/ //TODO: I need to store the original index and display it in the datatable
        "columns": [
            {   "data"  :   "id" },
            {   "data"  :   "name"  },
            {   "data"  :   "members"  },
            {   "data"  :   "size"  },
            {   "defaultContent":   "<button class=\"delete\">Borrar</button>"}
        ],
        responsive: true,
        "createdRow":function(row, data, index)
        {
            var name = data.id.toString();
            $(row).addClass(name)
            console.log(row)
        },
    });
    table.on( 'row-reorder', function ( e, details, edit ) {
        console.log( details );
    } );
    
    table.on( 'click', 'button', function () {
        var action = this.className; 
        var data = table.row( $(this).parents('tr') ).data();
        console.log(action);
        console.log(data);
        
        if(action === 'delete'){ //get data, modify table
            console.log("Numero de ID en la clase: " + data);
            $.ajax({
                url: "http://localhost:3000/work-queue/" + data.id,
                type: "DELETE",
                succes: function(result){
                    console.log("Succesfully Deleted " + result);
                }
            })
        }
    } );
} );