const { Mendieta } = require("./backend/core.js");
const services = require("./backend/services.js");
const queue_mgr = require("./backend/queue_mgr.js");
const { FakeStorage } = require("./backend/storage.js");

const storage = new FakeStorage();
const mendieta = new Mendieta(storage);
services.start(mendieta, process.env.PORT || 5000);
queue_mgr.start(mendieta, process.argv[2] || "/dev/ttyACM0");
