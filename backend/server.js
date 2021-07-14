const workQueueRoutes = require('./Routes/workQueueRoutes');
const staticPageRoutes = require('./Routes/staticPageRoutes');

const express = require('express'),
    app = express(),
    port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("../frontend/src"));

let wkQueueRoutes = workQueueRoutes(app);
let sticPageRoutes = staticPageRoutes(app);

app.listen(port);

console.log(`RESTful API server started on: http://localhost:${port}`);
