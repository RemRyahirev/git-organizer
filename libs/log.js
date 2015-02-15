/**
 * Created by Rem on 12.02.2015.
 */

var winston = require('winston'),
    config = require('./config'),
    path = require('path'),
    utils = require('./utils');

function getLogger(module) {
    var filePath = path.relative(config.get('basePath'), module.filename); //отобразим метку с именем файла, который выводит сообщение

    return new winston.Logger({
        transports: [
            new winston.transports.Console({
                colorize:  true,
                timestamp: utils.dateFormat,
                level:     config.get('log:level'),
                label:     filePath
            })
        ]
    });
}

module.exports = getLogger;