var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();
var server = app.listen(3001);
var io = require('socket.io').listen(server);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res, next) {
  res.sendFile(__dirname + '/index.html');
});

var users = [];
var db_driver = require('./dbdriver')();

io.on('connection', function(client) {

  client.on('join', function(name) {
    client.name = name;
    client.emit('user_list', users);
    users.push(name);
    client.broadcast.emit('new_join', name);
    db_driver.get_message(30, function (err, msgs) {
      if (err)
        console.log('Get historical data failed.')
      client.emit('historical', msgs.reverse());
    })
  });

  client.on('messages', function(message){
    console.log('get new message!');
    var name = client.name;
    var msg = {name: name, message: message, ts: getTS()};
    db_driver.new_message(msg, function (err, lastid) {
      if (err)
        console.log('Data base error');
    });
    client.broadcast.emit('messages', msg);
  });

  client.on('disconnect', function(name){
    var index = users.indexOf(client.name);
    if (index > -1) {
      users.splice(index, 1);
    }
    client.broadcast.emit('new_leave', client.name);
  });
});

// catch 404 and forward to error
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

function getTS() {
  function checkTime(i) {
    return (i < 10) ? "0" + i : i;
  }
  var today = new Date();
  var h = today.getHours();
  var m = today.getMinutes();
  var s = today.getSeconds();
  // add a zero in front of numbers<10
  m = checkTime(m);
  s = checkTime(s);
  return h + ":" + m + ":" + s;
}
