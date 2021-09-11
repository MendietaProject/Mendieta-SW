const { Mendieta } = require("./models.js");
const services = require("./services.js");
const QueueManager = require("./uzi/queue_mgr.js");

const mendieta = new Mendieta();
services.start(mendieta);

// TODO(Richo): Maybe
QueueManager.start(mendieta);
