const mysql = require('mysql');

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'li7758521',
    database: 'device'
})

module.exports = db; 