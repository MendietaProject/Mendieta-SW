const workQueueController = require('./controller/workQueueController');

const express = require('express'),
    app = express(),
    port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("../frontend/src"));
app.use(express.static("../physicalbits/gui"));

workQueueController(app);

app.listen(port);

console.log(`RESTful API server started on: http://localhost:${port}`);
