/* global require */
/* global module */

var _ = require('lodash');
var request = require('request-promise');

var deviceRegistry = {};
var variableRegistry = {};
var THROTTLE_TIMEOUT = 1000;

module.exports = {
    getDevices: _.throttle((authToken) => {
        return request({
            uri: 'https://api.particle.io/v1/devices',
            headers: {
                'Authorization': 'Bearer ' + authToken
            },
            json: true
        });
    }, THROTTLE_TIMEOUT),
    getDeviceDetail: (authToken, id) => {
        if (!deviceRegistry[id]) {
            deviceRegistry[id] = _.throttle((_authToken, _id) => {
                return request({
                    uri: 'https://api.particle.io/v1/devices/' + _id,
                    headers: {
                        'Authorization': 'Bearer ' + _authToken
                    },
                    json: true
                });
            }, THROTTLE_TIMEOUT);
        }

        return deviceRegistry[id](authToken, id);
    },
    getVariable: (authToken, deviceId, name) => {
        if (!variableRegistry[deviceId]) {
            variableRegistry[deviceId] = {};
        }
        if (!variableRegistry[deviceId][name]) {
            variableRegistry[deviceId][name] = _.throttle((_authToken, _id, _name) => {
                return request({
                    uri: 'https://api.particle.io/v1/devices/' + _id + '/' + _name,
                    headers: {
                        'Authorization': 'Bearer ' + _authToken
                    },
                    json: true
                });
            }, THROTTLE_TIMEOUT);
        }

        return variableRegistry[deviceId][name](authToken, deviceId, name);
    }
}
