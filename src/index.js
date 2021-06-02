var index = 1;
$(document).ready( function () {
    $('#table_id').DataTable({
        "ajax": "doc.JSON",
        "columns": [
            {   "data"  :   "index" },
            {   "data"  :   "name"  },
            {   "data"  :   "members"  },
            {   "data"  :   "size"  }
        ]
    });
} );