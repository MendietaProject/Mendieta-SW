const workQueueRoutes = require('./Routes/workQueueRoutes');

const express = require('express'),
    app = express(),
    port = process.env.PORT || 3000;

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


let wkQueueRoutes = workQueueRoutes(app);


app.listen(port);

console.log(`RESTful API server started on: http://localhost:/${port}`);