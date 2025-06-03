class Db {
    constructor() {
        this.sequelize = require('sequelize');
    }
    
    init() {
        const dbHost = process.env.MYSQL_HOST;
        const dbPort = process.env.MYSQL_PORT;
        const dbUser = process.env.MYSQL_USER;
        const dbPassword = process.env.MYSQL_PASSWORD;
        const dbName = process.env.MYSQL_DATABASE;

        return new this.sequelize.Sequelize(dbName, dbUser, dbPassword, {
            host: dbHost,
            port: dbPort,
            dialect: 'mysql',
            logging: false, // Disable logging; default: console.log
            pool: {
                max: 5, // Maximum number of connection in pool
                min: 0, // Minimum number of connection in pool
                acquire: 30000, // Maximum time (in ms) that pool will try to get a connection before throwing error
                idle: 10000 // Maximum time (in ms) that a connection can be idle before being released
            }
        });
    }
}


module.exports =  new Db().init();