var Sequelize = require('sequelize');

function Database(callback) {
    this.database = process.env.dbDatabase || 'scotbot';
    this.username = process.env.dbUsername || 'root';
    this.password = process.env.dbPassword || 'root';
    this.host = process.env.dbHost || '127.0.0.1';
    this.dialect = process.env.dbDialect || 'mysql';
    this.storage = process.env.dbStorage;

    this.sequalize = new Sequelize(this.database, this.username, this.password, {
        host: this.host,
        dialect: this.dialect,

        pool: {
            max: 10, // may need to be increased as we have more users
            min: 0,
            idle: 10000
        },
        logging: console.debug,

        storage: this.storage // quite possible that this is undefined
    });

    this.User = this.sequalize.define('user', {
        id: {
            type: Sequelize.INTEGER
        },
        username: {
            type: Sequelize.STRING
        },
        email: {
            type: Sequelize.STRING
        },
        avatar: {
            type: Sequelize.STRING
        },
        clientId: {
            type: Sequelize.STRING
        },
        clientSecret: {
            type: Sequelize.STRING
        }
    });

    this.sequalize.sync().then(function () {
        callback();
    });
}

module.exports = Database;
