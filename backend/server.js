const UpdateStreamController = require('./controllers/UpdateStreamController');
const SubmissionController = require('./controllers/SubmissionController');
const ActivityController = require("./controllers/ActivityController");
const { Mendieta } = require("./models.js");
const QueueManager = require("./uzi/queue_mgr.js");

const express = require('express'),
    ws = require("express-ws"),
    app = express(),
    port = process.env.PORT || 3000;

ws(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// TODO(Richo): This paths should be configurable
app.use(express.static("../frontend/src"));
app.use(express.static("../physicalbits/gui"));

const mendieta = new Mendieta();

// TODO(Richo): A class for each controller seems silly, maybe just group them in a services.js file?
UpdateStreamController.init(app, mendieta);
SubmissionController.init(app, mendieta);
ActivityController.init(app, mendieta);

QueueManager.start(mendieta);

app.listen(port);

console.log(`Server started on: http://localhost:${port}`);
