const { Activity } = require('./core');

const sqlite3 = require('sqlite3').verbose();

class Storage {
    constructor() {
        this.activities = [];
        this.students = [];

        this.db = new sqlite3.Database('x.db', (err) => {
            if (err) {
                console.error('Error', err.message);
            } else {
                console.log('Conectado');

                this.data_students();
                this.data_activities();
            }
        });
    }

    data_students() {
        this.db.all('SELECT * FROM students', [], (err, studentRows) => {
            if (err) {
                console.error('Error en estudiantes:', err.message);
                return;
            }
            this.students = studentRows;
            console.log('Datos de estudiantes obtenidos.');

            console.log('Datos de estudiantes:', this.students);
        });
    }

    data_activities() {
        this.db.all('SELECT * FROM activities', [], (err, activityRows) => {
            if (err) {
                console.error('Error en actividades:', err.message);
                return;
            }
            this.activities = activityRows;
            console.log('Datos de actividades obtenidos.');

            console.log('Datos de actividades:', this.activities);
        });
    }

   new_student() {
        const stdin = process.stdin;
        const stdout = process.stdout;

        stdin.resume();
        stdout.write('Ingrese el ID del nuevo estudiante: ');

        stdin.once('data', (id) => {
            id = id.toString().trim();

            stdout.write('Ingrese el Nombre del nuevo estudiante: ');

            stdin.once('data', (name) => {
               name = name.toString().trim();

                this.db.run('INSERT INTO students (id, name) VALUES (?, ?)', [id, name], (err) => {
                    if (err) {
                        console.error('Error al ingresar nuevo estudiante', err.message);
                        return;
                    }
                    console.log("Nuevo estudiante guardado");

                    this.closeDatabase();
                    stdin.pause();
                });
            });
        });
    }

    closeDatabase() {
        this.db.close((err) => {
            if (err) {
                console.error('Error', err.message);
            } else {
                console.log('Conexión a la base de datos cerrada.');
            }
        });
    }
}


class FakeStorage {

    activities = [];
    submissions = {};

    async getAllActivities() {
        return this.activities.map(activity => {
            return {id: activity.id, name: activity.name};
        });
    }
    async findActivity(id) {
        if (id == null) return null;
        return this.activities.find(activity => activity.id == id);
    }
    async storeActivity(activity) {
        this.activities.push(activity);
        this.submissions[activity.id] = [];
    }

    async getAllSubmissions(activityId) {
        return this.submissions[activityId];
    }
    async findSubmission(activityId, submissionId) {
        var submission = this.submissions[activityId].find(submission => submission.id == submissionId);
        return submission;
    }
    async storeSubmission(activityId, submission) {
        this.submissions[activityId].push(submission);
    }

}

function ActivityFromRow(row) {
    if (row == null) return null;
    var result = new Activity(row.name, row.test_duration);
    result.id = row.id;
    // TODO(Richo): Description!!
    return result;
}

class SqlStorage {
    constructor() {
        this.db = new sqlite3.Database('x.db', (err) => {
            if (err) {
                console.error('Error', err.message);
            } else {
                console.log('Conectado');
            }
        });
    }
    getAllActivities() {
        return new Promise((resolve, reject) => {
            this.db.all('SELECT * FROM activities', [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows.map(ActivityFromRow));
                }
            });
        });
    }
    async findActivity(id) {
        if (id == null) return null;
        return new Promise((resolve, reject) => {
            this.db.get("SELECT * FROM activities WHERE id = ?", [id], (err, row) => {
                if (err) { reject(err); }
                else { resolve(ActivityFromRow(row)); }
            })
        });
    }
    storeActivity(activity) {
        var id = activity.id;
        var name = activity.name;
        var duration = activity.testDuration;
        return new Promise((resolve, reject) => {
            this.db.run('INSERT INTO activities (id, name, test_duration) VALUES (?, ?, ?)', [id, name, duration], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    async getAllSubmissions(activityId) {
        return []
    }
    async findSubmission(activityId, submissionId) {
        return null;
    }
    async storeSubmission(activityId, submission) {
    }

}

module.exports = {
    FakeStorage: FakeStorage,
    SqlStorage: SqlStorage
  };
  