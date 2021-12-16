const fs = require('fs').promises;
const path = require('path');
const { Activity, Submission } = require("../core.js");

// TODO(Richo): Temporal! En algún momento vamos a persistir en disco!
class MemoryStorage {
  #activities = [];
  #mendieta = null;

  start(mendieta) {
    this.#mendieta = mendieta;
  }

  findActivity(id) {
    return this.#activities.find(activity => activity.id == id);
  }
  addActivity(activity) {
    this.#activities.push(activity);
  }
}

class FileStorage {
  #mendieta = null;

  start(mendieta) {
    this.#mendieta = mendieta;
    mendieta.on("activity-update", currentActivity => {
      // TODO(Richo): UPDATE STORAGE!
    });
    mendieta.on("submission-update", submission => {
      // TODO(Richo): UPDATE STORAGE!
    });
  }

  async findActivity(id) {
    try {
      // Buscar en disco archivo "/files/activities/<id>.json"
      let filePath = path.join(__dirname, "/files/activities/" + id + ".json");
      let fileContents = await fs.readFile(filePath);
      let data = JSON.parse(fileContents);
      return Activity.fromJSON(data);
    } catch (err) {
      if (err.code == 'ENOENT') {
        return null;
      }
      throw err;
    }
  }
  async addActivity(activity) {
    let id = activity.id;
    let filePath = path.join(__dirname, "/files/activities/" + id + ".json");
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(activity));
  }
  async getActivities() {
    let files = await fs.readdir(path.join(__dirname, "/files/activities/"));
    let jsonFiles = files.filter(file => path.extname(file) == ".json");
    let fullPaths = jsonFiles.map(file => path.join(__dirname, "/files/activities/" + file));
    let result = [];
    for (let i = 0; i < fullPaths.length; i++) {
      let fileContents = await fs.readFile(fullPaths[i]);
      result.push(JSON.parse(fileContents));
    }
    return result;
  }
}

module.exports = {
  MemoryStorage: MemoryStorage,
  FileStorage: FileStorage,
}
