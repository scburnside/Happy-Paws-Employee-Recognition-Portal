var express = require('express');
var app = express();
var mysql = require('./config/dbcon.js');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');

// Passport cofiguration
require('./config/passport.js')(passport);

const TWO_HOURS = 1000 * 60 * 60 * 2;

// Load default view-engine
app.set('view engine', 'ejs');

// Load database
app.set('mysql', mysql);

// Body Parser Middleware setup
app.use(bodyParser.urlencoded({extended: true}));

// Express-session Middleware setup
app.use(session({
    name: 'sid',
    resave: false,
    saveUninitialized: false,
    secret: 'shh! its a secret!',
    cookie: {
        maxAge: TWO_HOURS,
        sameSite: true,
        secure: false
    }
}));

// Passport Middleware setup
app.use(passport.initialize());
app.use(passport.session());

// Express-messages Middleware setup
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Serve Public directory as a static file
app.use(express.static('public'));
app.use('/public/signatures', express.static('public/signatures'));

// Set up global var for logged in user
app.use(function(req, res, next){
  res.locals.user = req.user || null;
  next();
})

// Routes to other files
app.use('/', require('./routes/authentication.js')); //Routes for home and login/registration
app.use('/users', require('./routes/users.js')); // Routes for User files
app.use('/users/admin', require('./routes/admin.js')); // Routes to Admin files


app.listen(3000, function(){
  console.log('Express started on http://localhost:3000; press Ctrl-C to terminate.');
});