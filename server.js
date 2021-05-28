const program = require('./Model/programModel');
const team = require('./Model/teamModel');
const student = require('./Model/studentModel');
const teamRoutes = require('./Routes/teamRoutes');

const express = require('express'),
    app = express(),
    port = process.env.PORT || 3000;

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))


let tmRoutes = teamRoutes(app);


app.listen(port);

console.log(`RESTful API server started on: http://localhost:/${port}`);