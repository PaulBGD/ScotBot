var express = require('express');
var sessions = require("client-sessions");
var bodyParser = require("body-parser");

var Database = require('../data/Database');
//var Users = require('./data/Users');
//var Uploader = require('./data/uploads');
//var Mail = require('./data/Mail');

var util = require('util');

var routes = {
    '/': 'index'
};

function Server(port, callback) {
    if (typeof port == 'function') {
        callback = port;
        port = undefined;
    }

    var app = express();

    this.port = port || 3000;
    this.app = app;

    this.database = new Database(function () {
        console.log("Connected to database.");
        if (callback) {
            setTimeout(callback, 0);
        }
    });
    //this.users = new Users(this);
    //this.uploader = new Uploader(this);
    //this.mail = new Mail(this);
    this.url = process.env.URL || 'localhost:3000';
}

Server.prototype.start = function () {
    var app = this.app;

    // setup our express application
    app.use(express.static(process.cwd() + '/static'));
    app.engine('.ejs', require('ejs').__express);
    app.set('view engine', 'ejs');
    app.set('views', process.cwd() + '/pages');
    app.use(sessions({
        cookieName: 'session',
        secret: process.env.cookieSecret || 'pU3tV9C2kvhHs4t6CVWl^a2qiSroGXOeXk@Pq2',
        duration: 3 * 31 * 24 * 60 * 60 * 1000 // 3 months?
    }));
    app.use(bodyParser.urlencoded({extended: false, limit: '10mb'}));
    app.use(bodyParser.json());
    app.enable('trust proxy');

    // setup routes
    for (var property in routes) {
        if (routes.hasOwnProperty(property)) {
            route(this, property, routes[property]);
        }
    }

    this.server = this.app.listen(this.port);
    console.log('Listening on ' + this.port + ' (' + this.url + ')');
};

Server.prototype.stop = function () {
    console.log('Stopping server..');
    // clear routes
    var routes = this.app._router.stack;
    routes.forEach(function removeMiddlewares(route, i, routes) {
        routes.splice(i, 1);
        if (route.route) {
            route.route.stack.forEach(removeMiddlewares);
        }
    });
    // shutdown server
    if (this.server) {
        this.server.close();
    }
    // delete variable
    delete this.server;
};


Server.prototype.restart = function () {
    if (this.server) {
        this.stop();
    }
    this.start();
};

function route(server, path, file) {
    if (typeof file == 'string') {
        server.app.get(path, function (req, res) {
            server.getData(req.session || {}, req.params, function (data) {
                res.render(file, data);
            });
        });
    } else if (util.isArray(file)) {
        for (var i = 0; i < file.length; i++) {
            route(server, path, file[i]);
        }
    } else if (typeof file == 'object') {
        for (var property in file) {
            if (file.hasOwnProperty(property)) {
                handle(server, path, file[property], property.indexOf('get') == 0 ? 'get' : 'post');
            }
        }
    } else if (typeof file == 'function') {
        handle(server, path, file, functionName(file).indexOf('get') == 0 ? 'get' : 'post');
    }
}

function handle(server, path, object, type) {
    server.app[type](path, function (req, res) {
        object(server, req, res);
    });
}

function functionName(fn) {
    var f = typeof fn == 'function';
    var s = f && ((fn.name && ['', fn.name]) || fn.toString().match(/function ([^\(]+)/));
    return (!f && 'not a function') || (s && s[1] || 'anonymous');
}

Server.prototype.getData = function (session, params, callback) {
    if (!params && !callback) {
        callback = session;
        session = {};
        params = {};
    }
    if (!callback) {
        callback = params;
        params = {};
    }
    var data = {
        logged_in: false,
        error: null,
        params: params
    };
    if (session.user) {
        data.logged_in = true;
        data.user = session.user;
        /*this.users.getUserFromId(data.user.id, function (err, user) {
            if (err || !user) {
                delete data.user;
                delete session.user;
                data.logged_in = false;
            } else {
                data.user = user;
            }
            callback(data);
        });*/
        callback(data);
    } else {
        callback(data);
    }
};

module.exports = Server;
