const { Mendieta } = require("./core.js");
const services = require("./services.js");
const queue_mgr = require("./uzi/queue_mgr.js");

const mendieta = new Mendieta();
services.start(mendieta);
queue_mgr.start(mendieta);
