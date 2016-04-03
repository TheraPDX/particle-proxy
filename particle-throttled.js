/* global require */
/* global module */

var _ = require('lodash');
var request = require('request-promise');

var devices = {};
var variables = {};

module.exports = {
    getDevices: _.throttle((authToken) => {
        return request({
            uri: 'https://api.particle.io/v1/devices',
            headers: {
                'Authorization': 'Bearer ' + authToken
            },
            json: true
        });
    }, 1000),
    getDeviceDetail: (authToken, id) => {
        if (!devices[id]) {
            devices[id] = _.throttle((_authToken, _id) => {
                return request({
                    uri: 'https://api.particle.io/v1/devices/' + _id,
                    headers: {
                        'Authorization': 'Bearer ' + _authToken
                    },
                    json: true
                });
            }, 1000);
        }

        return devices[id](authToken, id);
    }
}
