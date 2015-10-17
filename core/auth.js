var db = require(__dirname+'/db.js')();
var jwt = require('jsonwebtoken');

Auth = function (o) {
    // sql constants
    this.LOOKUP_AUTH_SQL = "select * from authorized_users where token = ?";
    this.LOOKUP_USER_SQL = "select * from players where username = ? and password = ?";
    this.INSERT_AUTH_SQL = "insert into authorized_users (user_id, token) values (?,?) on duplicate key update token = ?";
    
    // auth constants
    this.ALGORITHMS = {algorithms: ['RS256']};
    
    
    this.options = {
       ssl: {key: '', cert: ''} // {} with key & cert
    }
    
    // parse passed in option overrides
    this.setOptions(o);
    
}

Auth.prototype = {
    constructor : Auth,
    setOptions : function(o) {
        if (o) {
            for (var i in this.options) {
                this.options[i] = o[i] ? o[i] : this.options[i];
            }
        }    
    },
    printOptions : function() {
        for (var i in this.options) {
            console.log("%s : %s",i,this.options[i]);
        }
    }
}

Auth.prototype.validateUser = function(data, cb) {
    var credentials = [data.user, data.pass];
    var key = this.options.ssl.key;
    var token = false;

    db.query(this.LOOKUP_USER_SQL, credentials, function(err, rows, fields) {
        if (rows[0]) {
            
            token = jwt.sign({ user: rows[0].user_id}, key, { algorithm: 'RS256'});        
            
            // save our authorization to the database
            var params = [rows[0].user_id, token, token];
            console.log('Generating token for %s',rows[0].user_id);
            db.query(this.INSERT_AUTH_SQL, params);
        } 
        
        // return token
        cb(null,token);
    }.bind(this));
    
}

Auth.prototype.checkAuth = function(data, cb) {
    var checkToken = data.token;
    var cert = this.options.ssl.cert;
    
    // see if user exists in auth table
    db.query(this.LOOKUP_AUTH_SQL, [checkToken], function(err, rows, fields) {
        console.log(rows);
        if (rows[0]) {
            // found a user, check token to see if it matches our lookup
            if (checkToken == rows[0].token) {
                // same token as we have in database, verify it's valid
                jwt.verify(checkToken, cert, this.ALGORITHMS, function(err, decoded) {
                    if (err) {
                        // we were unable to verify the signed key
                        cb({err: 1, message: "invalid cert"}, false);
                    } else {
                        if (rows[0].user_id == decoded.user) {
                            // we verified the same user and valid token
                            cb(null, true);
                        } else {
                            // token userids don't match
                            cb({err: 1, message: "invalid user for token"});
                        }
                    }
                });    
            } else {
                // tokens don't match
                cb({err: 1, message: "unmatched token"},false);
            }

        }  else {
            // token wasn't in authorized db
            cb({err: 1, message: "user not authorized"}, false);
        }
    });
}

// exports
module.exports = exports = function(o) {
    return new Auth(o);
}