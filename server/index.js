const { Mendieta } = require("./backend/core.js");
const services = require("./backend/services.js");
const queue_mgr = require("./backend/queue_mgr.js");

const mendieta = new Mendieta();
services.start(mendieta);
queue_mgr.start(mendieta);
