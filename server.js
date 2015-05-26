"use strict";
var express = require('express');
var mysql = require('mysql');
var app = express();
var bodyParser = require('body-parser');
//var cookieParser = require('cookie-parser');


var Sequelize = require('sequelize');

var sequelize = new Sequelize('test', 'root', 'root', {
  host: '104.131.191.81',
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
   dialectOptions: {
      socketPath: "/var/run/mysqld/mysqld.sock"
    },
});

app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({ extended: true }));

app.set('port', 3000);

var User = sequelize.define('user', {
  firstName: {
    type: Sequelize.STRING,
    field: 'first_name', // Will result in an attribute that is firstName when user facing but first_name in the database,
  },
  lastName: {
    type: Sequelize.STRING,
  }
}, {
  freezeTableName: true // Model tableName will be the same as the model name
});

var Activity = sequelize.define('ACTIVITY', {
  act_uID: {
    type: Sequelize.STRING,
    field: 'act_uID', // Will result in an attribute that
    primaryKey: true,
    unique: true
  },
  act_tstamp: {
    type: Sequelize.STRING,
    field: 'act_tstamp'
  },
  act_level: {
    type: Sequelize.INTEGER,
    field: 'act_level',
    allowNull: false
  },
}, {
  freezeTableName: true // Model tableName will be the same as the model name
});

Activity.sync();


User.sync();//.then(function () {
  // Table created
/*  return User.create({
    firstName: 'John',
    lastName: 'Hancock'
  });
});*/

User
  .findOrCreate({where: {firstName: 'John'}})
  .spread(function(user, created) {
    console.log(user.get({
      plain: true
    }));
    console.log(created);
  });

app.post('/updateactivity', function(req,res) {
  var post = { "act_level": req.body.activityaverage,
                "act_tstamp": req.body.timestamp,
                  "act_uID": req.body.username };
  Activity
    .upsert( post, [ req.body.activityaverage, req.body.timestamp ] );

});

app.get('/activityaverage', function(req, res) {
  Activity.count().then( function(count) {
    Activity.sum("act_level").then( function( sum ) {
      var average = sum/count;
      res.json(average);
    });
    });
});

/* req.body = { "first": string, "last": string } */
app.post('/user', function(req, res) {
  var post = { "firstName": req.body.first, "lastName": req.body.last };
  User
    .upsert( post );
});

app.post('/updateunique', function(req, res) {
  var post = { "firstName": req.body.first, "lastName": req.body.last };
  User
    .update( post );
});


app.listen(app.get('port'));
console.log('Express server listening on port ' + app.get('port'));

