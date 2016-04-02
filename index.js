var express = require('express');
var bodyParser = require('body-parser');

var app = express();
var appPort = process.argv[2] || process.env.PORT || 8090;
var proxyAuthToken = process.argv[3] || process.env.PROXY_AUTH_TOKEN;
var particleAuthToken = process.argv[4] || process.env.PARTICLE_AUTH_TOKEN;

var devices = [];
var router = express.Router();

app.use(bodyParser.json());

app.use('*', (req, res, next) => {
    if (req.headers.authorization !== proxyAuthToken) {
        res.status(403).json({ status: 403, message: 'No auth token found' });
    }
    else {
        next();
    }
});

router.get('/status', (req, res) => {
    res.status(200).json({
        status: '200',
        proxyTokenFound: !!proxyAuthToken,
        particleTokenFound: !!particleAuthToken,
        devicesRegistered: devices.length
    });
});

app.use('/api/v1', router);

console.log('listening on port ' + appPort);
app.listen(appPort);
