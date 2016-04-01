var express = require('express');
var bodyParser = require('body-parser');

var app = express();
var appPort = process.argv[2] || 8090;

app.use(bodyParser.json());

app.all('*', (req, res) => {
    res.status(200).json(req.headers.authorization);
});

console.log('listening on port ' + appPort);
app.listen(appPort);
