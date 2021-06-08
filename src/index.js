$(document).ready( function () {
    var table = $('#table_id').DataTable({
        
        "ajax": "doc.JSON",
        "columns": [
            {   "data"  :   "index" },
            {   "data"  :   "name"  },
            {   "data"  :   "members"  },
            {   "data"  :   "size"  },
            { "defaultContent" : "<button class=\"modify\">Modificar Prioridad</button><button class=\"delete\">Eliminar</button>"
        }],
        rowReorder:{
            dataSrc: "index"
        },
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