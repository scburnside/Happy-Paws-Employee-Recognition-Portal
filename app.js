var express = require('express');
var app = express();
var bodyParser = require('body-parser');

// Load default view-engine
app.set('view engine', 'ejs');

// Body Parser Middleware setup
app.use(bodyParser.urlencoded({extended: true}));

// Serve Public directory as a static file
app.use(express.static('public'));

// Set up home route
app.get('/', function(req, res){
	var page = {
		title: "Home"
	};

	res.render('home', {page: page});
});

// Routes to other files
var users = require('./routes/users.js');
app.use('/users', users);

// Routes to Admin files
var admin = require('./routes/admin.js');
app.use('/users/admin', admin);


app.listen(3000, function(){
  console.log('Express started on http://localhost:3000; press Ctrl-C to terminate.');
});