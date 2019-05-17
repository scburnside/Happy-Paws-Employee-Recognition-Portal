const LocalStrategy = require('passport-local').Strategy;
var mysql = require('./dbcon.js');
const bcrypt = require('bcryptjs');
var admin = false;

module.exports = function(passport){
    passport.use(
        new LocalStrategy({ usernameField: 'email', passReqToCallback: true }, function(req, email, password, done){
            if(req.body.isAdmin){
                // confirm user is in admin DB
                mysql.pool.query('SELECT * FROM admin WHERE userName = ?', [email], function(error, users){
                    if(!users.length){
                        return done(null, false, req.flash('warning', 'Incorrect username or password.'));
                    }
    
                    // now we need to verify password
                    const user = users[0];
                    bcrypt.compare(password, user.password, function(err, isMatch){
                        if(err) throw err;
    
                        if(isMatch){
                            admin = true;
                            return done(null, user);
                        } else{
                            return done(null, false, req.flash('warning', 'Incorrect username or password.'));
                        }
                    })
                });
            } else{
                // confirm user is in user DB
                mysql.pool.query('SELECT * FROM user WHERE email = ?', [email], function(error, users){
                    if(!users.length){
                        return done(null, false, req.flash('warning', 'Incorrect email or password.'));
                    }
    
                    // now we need to verify password
                    const user = users[0];
                    bcrypt.compare(password, user.password, function(err, isMatch){
                        if(err) throw err;
    
                        if(isMatch){
                            admin = false;
                            return done(null, user);
                        } else{
                            return done(null, false, req.flash('warning', 'Incorrect email or password.'));
                        }
                    })
                });
            }
        })
    );

    passport.serializeUser(function(user, done) {
        if(user.isAdmin){
            // done(null, user.adminId);
            done(null, user)
        } else{
            // done(null, user.userId);
            done(null, user)
        };
      });
      
      passport.deserializeUser(function(user, done) { //id
        if(user.isAdmin){
            mysql.pool.query('SELECT * FROM admin WHERE adminId = ?', [user.adminId], function(err, results){
                done(err, results[0]);
            });
        } else{
            mysql.pool.query('SELECT * FROM user WHERE userId = ?', [user.userId], function(err, results){
                done(err, results[0]);
            });
        };
      });
}
