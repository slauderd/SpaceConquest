// game libs
require("./core/game_manager.js");
require("./core/game.js");
require("./public/js/player.js");
require("./public/js/planet.js");
require("./public/js/ship.js");

require("./core/auth.js");

// game server
var config = require("config");
var fs = require('fs');
var http = require('http');
var https = require('https');
var jwt = require('jsonwebtoken');
var url = require('url');


var sslOptions = {
  key: fs.readFileSync(config.SSL.key),
  cert: fs.readFileSync(config.SSL.cert),
  ca: fs.readFileSync(config.SSL.ca),
  requestCert: true,
  rejectUnauthorized: false
};


var httpPort = config.GameServer.httpPort;
var httpsPort = config.GameServer.httpsPort;

var path = require('path');
var async = require('async');

var sio = require('socket.io');
var sioClient = require('socket.io-client')(config.GameServer.AuthURL);
var express = require('express');
var httpApp = express();
var httpsApp = express();

// add post parsing
var bodyParser = require('body-parser');
httpsApp.use(bodyParser.urlencoded({extended: false}));
httpsApp.use(bodyParser.json());


function Validate(user, pass) {
    
    sioClient.emit("authenticate", {
        user: user,
        pass: pass
    }, function(error, token) {
        if (error) {
            console.log('handle this error');
        } else {
            return token;
        }
        //console.log(message);
    });
    // var token = jwt.sign({ user: user}, sslOptions.key, { algorithm: 'RS256'});
    
    // return token;
}



// create servers
var server = http.createServer(httpApp);
var secureServer = https.createServer(sslOptions, httpsApp);

// attach to https for ws stuff
var io = sio(secureServer);

// setup auth handling
sioClient.on('connect', function() {
    console.log('connected to auth server!');
});
sioClient.on('disconnect', function() {
    console.log('disconnected from auth server!');
})


// redirect pages
var redirectIndex = 'https://www.xadb.com:'+httpsPort;
var redirectAuth = 'https://www.xadb.com:'+httpsPort+'/login.html';

// handle http forward
httpApp.get('*', function(req,res) {
  console.log('Redirecting to %s',redirectIndex);
  res.redirect(redirectIndex);
});

// static content delivery
httpsApp.use(express.static(__dirname+'/auth'));
httpsApp.use(express.static(__dirname+'/game'));
httpsApp.use(express.static(__dirname+'/public'));

// test all requests to verify they are authenticated, otherwise send them to login
httpsApp.all('*', function (req,res,next) {
    console.log('request');
    var token = req.query.t;
    
    if (token) {
        console.log('had a token, allowing: '+token);    
        next();
    } else {
        console.log(req.url);
        if (req.url === '/favicon.ico') {
            next();
        } else if (!/^\/auth/.test(req.url)) {
            console.log('redirecting to '+redirectAuth)
            res.redirect(redirectAuth);
        } else {
            next();        
        }

        
    }
});

// handle validates
httpsApp.post("/auth/validate", function (req, res) {
    console.log('validate');
    console.log(req.body);

    console.log("%s - %s",req.body.user,req.body.pass);    
    console.log('generating token');
    
    sioClient.emit("validate_user", {
        user: req.body.user,
        pass: req.body.pass
    }, function(error, token) {
        if (error) {
            console.log('handle this error');
            console.log('validation failed');
        } else {
            var status = token ? 'OK' : 'Failed';
            
            res.json({
                token: token,
                expires: 60 * 5,
                status: status
            });
            
            // verify token
            sioClient.emit("check_auth_token", {
                token: token 
            }, function(error, data) {
                if (error) {
                    console.log("%s %s",error.err, error.message);
                }
                console.log('auth token was '+data);
            });
        }
        //console.log(message);
    });

});


io.on('connection', function (socket) {
    console.log("connection");

    socket.on("message", function(msg) {
      console.log(msg);
    });
    
});


server.listen(httpPort, function(){
   var addr = server.address();
   console.log("http server listening at", addr.address + ":" + addr.port);
});

secureServer.listen(httpsPort, function() {
  var addr = secureServer.address();
  console.log("https server listening at", addr.address + ":" + addr.port);
});

// // start the game manager
var manager = new GameManager();
manager.start();

// create a new game
var newGame = manager.createGame();

