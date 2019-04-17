var express = require('express');
var app = express();
var mysql = require('./config/dbcon.js');
var bodyParser = require('body-parser');

// Load default view-engine
app.set('view engine', 'ejs');

// Load database
app.set('mysql', mysql);

// Body Parser Middleware setup
app.use(bodyParser.urlencoded({extended: true}));

// Serve Public directory as a static file
app.use(express.static('public'));
//app.use('/public/signatures', express.static('public/signatures'));

// Set up home route
app.get('/', function(req, res){
	var page = {
		title: "Home"
	};

	res.render('home', {page: page});
});

// Routes to other files
app.use('/users', require('./routes/users.js')); // Routes for user login/registration 
app.use('/users/admin', require('./routes/admin.js')); // Routes to Admin files


app.listen(3000, function(){
  console.log('Express started on http://localhost:3000; press Ctrl-C to terminate.');
});