const workQueueRoutes = require('./Routes/workQueueRoutes');
const staticPageRoutes = require('./Routes/staticPageRoutes');

const express = require('express'),
    app = express(),
    port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// TODO: CHECK IF ALL THESE ARE NECESSARY
app.use(express.static("../frontend/"));
app.use(express.static("../frontend/Bootstrap"));
app.use(express.static("../frontend/DataTables-1.10.24"));
app.use(express.static("../frontend/jQuery-3.3.1"));
app.use(express.static("../frontend/Responsive-2.2.8"));
app.use(express.static("../frontend/RowReorder-1.2.8"));
app.use(express.static("../frontend/src"));



// Configurar cabeceras y cors
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});


let wkQueueRoutes = workQueueRoutes(app);
let sticPageRoutes = staticPageRoutes(app);


app.listen(port);

console.log(`RESTful API server started on: http://localhost:${port}`);
