var dotenv = require('dotenv').config();
var express = require('express');
var router = express.Router();
var knex = require('knex')({
  client: 'mysql',
  connection: {
    host: (process.env.sqlhost),
    user: (process.env.sqluser),
    password: (process.env.sqlpassword),
    database: (process.env.sqldatabase)
  }
});
var prod = process.env.production;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Home', prod: prod });
  console.log(prod);
});

module.exports = router;
