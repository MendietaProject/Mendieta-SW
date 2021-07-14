const workQueueRoutes = require('./Routes/workQueueRoutes');
const staticPageRoutes = require('./Routes/staticPageRoutes');

const express = require('express'),
    app = express(),
    port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
