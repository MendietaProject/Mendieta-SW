const workQueueController = require('./controller/workQueueController');
const initActivityController = require("./controller/ActivityController");

const express = require('express'),
    app = express(),
    port = process.env.PORT || 3000;

const serverState = {
  activities: [],
  currentActivity: null
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("../frontend/src"));
app.use(express.static("../physicalbits/gui"));

workQueueController(app);
initActivityController(app, serverState);

app.listen(port);

console.log(`RESTful API server started on: http://localhost:${port}`);
