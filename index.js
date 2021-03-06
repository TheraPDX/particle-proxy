/* global require */

var express = require('express');
var bodyParser = require('body-parser');
var _ = require('lodash');
var request = require('request-promise');

var findDevices = require('./findDevices');
var particle = require('./particle-throttled');

var app = express();
var appPort = process.argv[2] || process.env.PORT || 8090;
var proxyAuthToken = process.argv[3] || process.env.PROXY_AUTH_TOKEN;
var particleAuthToken = process.argv[4] || process.env.PARTICLE_AUTH_TOKEN;

var devices = findDevices(5);
var router = express.Router();

function getApiStatus() {
    if (!proxyAuthToken || !particleAuthToken) {
        return 'error - no auth';
    }
    else if (devices.length === 0) {
        return 'error - no devices';
    }
    else {
        return 'okay';
    }
}

function authorizeRequest(req, res, next) {
    if (!req.headers.authorization) {
        res.status(403).json({ status: 403, message: 'No auth token found' });
    }
    else if (req.headers.authorization.split(' ')[1] !== proxyAuthToken) {
        res.status(403).json({ status: 403, message: 'Auth token malformed' });
    }
    else {
        next();
    }
}

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});

router.options('*', (req, res) => {
    res.sendStatus(200);
});

router.get('/status', authorizeRequest, (req, res) => {
    res.status(200).json({
        apiStatus: getApiStatus(),
        proxyTokenFound: !!proxyAuthToken,
        particleTokenFound: !!particleAuthToken,
        devicesRegistered: devices.length
    });
});

router.get('/devices', authorizeRequest, (req, res) => {
    particle.getDevices(particleAuthToken).then((result) => {
        res.status(200).json(_.filter(result, value => {
            return _.includes(devices, value.id);
        }));
    }).catch(response => {
        console.log(response.options);
        res.status(response.statusCode).json(response.error);
    });
});

router.get('/devices/:id', authorizeRequest, (req, res) => {
    particle.getDeviceDetail(particleAuthToken, req.params.id).then(result => {
        res.status(200).json(result);
    }).catch(response => {
        console.log(response.options);
        res.status(response.statusCode).json(response.error);
    });
});

router.get('/devices/:id/:variable', authorizeRequest, (req, res) => {
    particle.getVariable(particleAuthToken, req.params.id, req.params.variable).then(result => {
        res.status(200).json(result);
    }).catch(response => {
        console.log(response.options);
        res.status(response.statusCode).json(response.error);
    });
});

app.use('/api/v1', router);

console.log('listening on port ' + appPort);
app.listen(appPort);
