var fs = require('fs');
var path = require('path');
var os = require('os');
var exec = require('child_process').exec;
var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function Utils() {

}

Utils.prototype.deleteDirectory = function rmdir(dir, callback) {
    var command = 'rm -rf ';
    if (os.platform() == 'win32') {
        // windows
        command = 'rmdir /s/q ';
    }
    exec(command + dir, function(err, stdout, stderr) {
        if (err) {
            return callback(err);
        }
        if (stdout) {
            console.log(stdout);
        }
        if (stderr) {
            console.error(stderr);
        }
        callback();
    });
};

Utils.prototype.writeFile = function (file, content, sync, callback) {
    if (typeof sync == 'function') {
        callback = sync;
        sync = false;
    }
    if (sync) {
        try {
            fs.writeFileSync(file, content);
            callback();
        }
        catch (err) {
            callback(err);
        }
    }
    else {
        fs.writeFile(file, content, callback);
    }
};

Utils.prototype.readFile = function (file, sync, callback) {
    if (typeof sync == 'function') {
        callback = sync;
        sync = false;
    }
    if (sync) {
        var data = fs.readFileSync(file);
        callback(undefined, data);
        return data;
    }
    else {
        fs.readFile(file, callback);
    }
};

Utils.prototype.mergeObject = function (mergingTo, mergingFrom) {
    for (var property in mergingFrom) {
        if (mergingFrom.hasOwnProperty(property) && !mergingTo[property]) {
            mergingTo[property] = mergingFrom[property];
        }
    }
    return mergingTo;
};

Utils.prototype.each = function (object, func) {
    if (Array.isArray(object)) {
        for (var i = 0; i < object.length; i++) {
            var value = func(i, object[i]);
            if (value) {
                return value;
            }
        }
    } else {
        for (var property in object) {
            if (object.hasOwnProperty(property)) {
                value = func(property, object[property]);
                if (value) {
                    return value;
                }
            }
        }
    }
};

Utils.prototype.replaceObject = function (object, path, replaceWith) {
    path = path.split('.');
    var original = object;
    var parent = null;
    this.each(path, function (index, object) {
        if (index == path.length - 1) {
            parent = original;
        }
        original = original[object];
    });
    if (parent !== null) {
        parent[path[path.length - 1]] = replaceWith;
    }
    return original;
};

/**
 * Copy of Node util timestamp function.
 * Because it makes sense, Node makes private util methods in the util class.
 * @returns {string}
 */
Utils.prototype.timestamp = function () {
    var d = new Date();
    var time = [this.pad(d.getHours()),
        this.pad(d.getMinutes()),
        this.pad(d.getSeconds())].join(':');
    return [d.getDate(), months[d.getMonth()], time].join(' ');
};

/**
 * Pads a number so it always has two digits.
 * @param n the number
 * @returns {string}
 */
Utils.prototype.pad = function (n) {
    return n < 10 ? '0' + n.toString(10) : n.toString(10)
};

module.exports = new Utils();