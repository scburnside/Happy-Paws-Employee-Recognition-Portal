const LocalStrategy = require('passport-local').Strategy;
var mysql = require('./dbcon.js');
const bcrypt = require('bcryptjs');

module.exports = function(passport){
    passport.use(
        new LocalStrategy({ usernameField: 'email', passReqToCallback: true }, function(req, email, password, done){
            // confirm user is in DB
            mysql.pool.query('SELECT * FROM user WHERE email = ?', [email], function(error, users){
                if(!users.length){
                    return done(null, false, req.flash('danger', 'That email is not registerd.'));
                }

                // now we need to verify password
                const user = users[0];
                bcrypt.compare(password, user.password, function(err, isMatch){
                    if(err) throw err;

                    if(isMatch){
                        return done(null, user);
                    } else{
                        return done(null, false, req.flash('danger', 'Incorrect password.'));
                    }
                })
            })
        })
    );

    passport.serializeUser(function(user, done) {
        done(null, user.userId);
      });
      
      passport.deserializeUser(function(id, done) {
        mysql.pool.query('SELECT * FROM user WHERE userId = ?', [id], function(err, results){
            done(err, results[0]);
        })
      });
}
