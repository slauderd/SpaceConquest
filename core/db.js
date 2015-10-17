////////////////////////////////////////////////////////////////////////////////
// setup database connection
var mysql = require('mysql');
var config = require('config');

var db = mysql.createConnection(config.get('UserDB'));

module.exports = exports.db = function() {
    return db;
}
