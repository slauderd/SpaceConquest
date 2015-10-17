var config = require('config');
var https = require("https");
var sio = require('socket.io');
var fs = require('fs');
var express = require('express');
var jwt = require('jsonwebtoken');
var app = express();


////////////////////////////////////////////////////////////////////////////////
// globals
var host = "www.xadb.com";
var port = 8444;
var authorized_users = [];

var sslOptions = {
  key: fs.readFileSync('./ssl/server.key'),
  cert: fs.readFileSync('./ssl/server.crt'),
  ca: fs.readFileSync('./ssl/ca.crt'),
  requestCert: true,
  rejectUnauthorized: false
};

// authorization ob
var auth = require('./core/auth.js')({ssl: sslOptions});

// setup server router
var secureServer = https.createServer(sslOptions, app).listen(port, function () {
    console.log("Secure express started on port %s",port);
});

// setup socket
var io = require('socket.io')(secureServer);
io.on("connection",handleIO);

////////////////////////////////////////////////////////////////////////////////
function handleIO(socket) {
    console.log("new connection from address: %s",socket.conn.remoteAddress);
    
    socket.on('*',function(msg) {
       console.log('any request'); 
    });
    
    
    socket.on('message', function(msg) {
       console.log('received a message: '+msg);
       socket.emit('test','Received your message: "'+msg+'"');
    });
    
    socket.on('check_auth_token', function (data, cb) {
        auth.checkAuth(data,cb);
    });
    
    socket.on('get_auth_token', function (data, cb) {
    });
    
    socket.on('validate_user', function (data, cb) {
        auth.validateUser(data, cb);
    });
    

    
    socket.on('disconnect', function() {
       console.log('disconnected'); 
    });
}

