var dotenv = require('dotenv').config();
var express = require('express');
var router = express.Router();
var knex = require('knex')({
<<<<<<< HEAD
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
=======
    dialect: 'mysql',
    connection: {
        host: (process.env.sqlhost),
        user: (process.env.sqluser),
        password: (process.env.sqlpassword),
        database: (process.env.sqldatabase)
    }
});
var moment = require('moment');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Express' });
});

router.get('/route/:slug', function (req, res, next) {
    var routeslug = req.params.slug;
    var results;
    knex('table').select('*').where('slug', routeslug).then(function (resp) {
        results = resp[0];
        res.render('template', { title: title, results: results, moment: moment });
    });
>>>>>>> 8b9c950c0f87ddb56e1a823c3adc2dafc6929288
});

module.exports = router;
