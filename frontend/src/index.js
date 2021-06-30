$(document).ready( function () {
    var table = $('#table_id').DataTable({
        "ajax": {url:"http://localhost:3000/work-queue",
         dataSrc:''
    },
        rowReorder:{
            dataSrc: "index"
        }, //TODO: I need to store the original index and display it in the datatable
        "columns": [
            {   "data"  :   "index" },
            {   "data"  :   "name"  },
            {   "data"  :   "members"  },
            {   "data"  :   "size"  },
            { "defaultContent" : "<button class=\"details\">Mostrar Detalles</button><button class=\"delete\">Eliminar</button>"
        }],
        responsive: true
    });

    $('#table_id tbody').on( 'click', 'button', function () {
 
        var action = this.className; 
        var data = table.row( $(this).parents('tr') ).data();
        console.log(action);
        
        if(action==='modify'){
            
        }
        if(action === 'delete'){
            table.row( $(this).parents('tr')).remove().draw();
        }
    } );
} );