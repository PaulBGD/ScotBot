var utils = require('./utils');
var fs = require('fs');
var path = require('path');

function Logger(console) {
    console._log = console.log;
    console._warn = console.warn || console.log;
    console._error = console.error;
    console._debug = console.debug || console.log;
    for (var method in Logger.prototype) {
        if (method != 'constructor') {
            console[method] = this[method];
        }
    }
}

Logger.prototype.log = function (message, e) {
    console._log(formatMessage(message, e, 'INFO'))
};

Logger.prototype.warn = function (message, e) {
    console._warn(formatMessage(message, e, 'WARN'))
};

Logger.prototype.error = function (message, e) {
    console._error(formatMessage(message, e, 'ERROR'))
};

Logger.prototype.debug = function (message, e) {
    if (process.env.NODE_ENV == 'development') {
        console._debug(formatMessage(message, e, 'DEBUG'))
    }
};

function formatMessage(message, object, type) {
    if (!message) {
        message = '';
    } else if (typeof message !== 'string') {
        object = message;
        message = '';
    }
    if (object) {
        if (message !== '') {
            message += '\n';
        }
        if (object instanceof Error) {
            message += object.stack;
        } else {
            message += JSON.stringify(object);
        }
    }
    var final = '[' + utils.timestamp() + '][' + type + '] ' + message;
    fs.appendFile(path.join(process.cwd(), 'log.txt'), final + '\n', function () {
    });
    return final;
}

module.exports = Logger;