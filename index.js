var Connector = require('./src/beam/Connector');
var connector = new Connector();

connector.connect(process.env.USERNAME, process.env.PASSWORD, function(err, connection) {
    if (err) {
        throw err;
    }
    // do stuff

});