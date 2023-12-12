import mysql from 'mysql-await'; // npm install mysql-await

// first -- I want a connection pool: https://www.npmjs.com/package/mysql#pooling-connections
// var connPool = mysql.createPool({
//   connectionLimit: 5, // it's a shared resource, let's not go nuts.
//   host: "cse-mysql-classes-01.cse.umn.edu",
//   user: 'C4131F23U202',
//   database: 'C4131F23U202',
//   password: '40854',
// });

var connPool = mysql.createPool({
  connectionLimit: 5,
  host: 'localhost',
  user: 'root',
  database: 'CSCI4131',
  password: 'password',
});
