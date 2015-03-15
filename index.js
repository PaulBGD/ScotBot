var Server = require('./src/server');

var Logger = require('./src/util/Logger');
new Logger(console);

var Connector = require('./src/beam/Connector');
var connector = new Connector();

var server = new Server(function() {
    server.start();
    console.log('Server started');
});

//connector.connect(process.env.USERNAME, process.env.PASSWORD, function(err, connection) {
//    if (err) {
//        throw err;
//    }
    // do stuff

//});
