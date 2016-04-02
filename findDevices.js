/* global module */
/* global require */

module.exports = (argvIndexStart) => {
    var _ = require('lodash');

    var devices = _.filter(process.env, (value, key) => {
        return /DEVICE_/.test(key);
    });

    if (devices.length === 0 && process.argv.length > argvIndexStart) {
        devices = _.takeRight(process.argv, process.argv.length - argvIndexStart)
    }

    return devices;
};
