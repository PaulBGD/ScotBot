var toughCookie = require('tough-cookie');
var request = require('request').defaults({
    jar: toughCookie
});
var async = require('async');
var WebSocket = require('ws');
var BeamConnection = require('./BeamConnection');

const endpoint = 'https://beam.pro/api/v1/';

function Connector() {

}

Connector.prototype.connect = function(username, password, callback) {
    var $this = this;
    async.waterfall([
        function (callback) {
            request.post(endpoint + 'users/login', {
                json: {
                    username: process.env.USERNAME,
                    password: process.env.PASSWORD
                },
                jar: toughCookie
            }, function (err, status, body) {
                callback(err, err ? undefined : body.id);
            });
        },
        function (id, callback) {
            request(endpoint + 'channels/search?scope=names&query=PaulBGD', {jar: toughCookie}, function (err, status, body) {
                return callback(err, err ? undefined : JSON.parse(body)[0].id, id);
            });
        },
        function (id, myId, callback) {
            request(endpoint + 'chats/' + id, {jar: toughCookie}, function (err, status, body) {
                if (err) {
                    return callback(err);
                }
                var json = JSON.parse(body);
                callback(err, json.endpoints[0], json.authkey, id, myId);
            });
        },
        function (endpoint, authkey, id, myId, callback) {
            callback(null, new BeamConnection(new WebSocket(endpoint), id, myId, authkey));
        }
    ], callback);
};

module.exports = Connector;