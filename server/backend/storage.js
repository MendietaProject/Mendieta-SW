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

    getAllActivities() {
        return this.activities.map(activity => {
            return {id: activity.id, name: activity.name};
        });
    }
    findActivity(id) {
        if (id == null) return null;
        return this.activities.find(activity => activity.id == id);
    }
    storeActivity(activity) {
        this.activities.push(activity);
        this.submissions[activity.id] = [];
    }

    getAllSubmissions(activityId) {
        return this.submissions[activityId];
    }
    findSubmission(activityId, submissionId) {
        var submission = this.submissions[activityId].find(submission => submission.id == submissionId);
        return submission;
    }
    storeSubmission(activityId, submission) {
        this.submissions[activityId].push(submission);
    }

}


module.exports = {
    FakeStorage: FakeStorage,
  };
  