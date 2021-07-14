const workQueueRoutes = require('./Routes/workQueueRoutes');

const express = require('express'),
    app = express(),
    port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("../frontend/src"));
app.use(express.static("../physicalbits/gui"));

let wkQueueRoutes = workQueueRoutes(app);

app.listen(port);

console.log(`RESTful API server started on: http://localhost:${port}`);
