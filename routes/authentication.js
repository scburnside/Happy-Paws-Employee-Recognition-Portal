const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check'); //middleware for express-validator
const multer = require('multer');

// Middleware setup for multer
const storage = multer.diskStorage({
	destination: function(req, file, cb){
		cb(null, './public/signatures'); // specify storage location for user signature images
	},
	filename: function(req, file, cb){
		cb(null, Date.now() +  file.originalname); // specify file name to give signature
	}
})

// Filter file setup for storing signatures
const fileFilter = function(req, file, cb){
	if(file.mimetype === 'image/png' || file.mimetype === 'image/jpeg'){ //store only jpeg and png images, reject all others 
		cb(null, true);
	} else {
		cb(null, false);
	}
}

const upload = multer({storage: storage, fileFilter: fileFilter});

// Home route
router.get('/', function(req, res){
	var page = {
		title: "Home"
	};

	res.render('home', {page: page});
});

// Route for user registration
router.get('/register', function(req, res){
	var page = {
		title: "Register"
	}

	res.render('register', {page: page});
})

// Route for user login
router.get('/login', function(req, res){
	var page = {
		title: "Login"
	}

	res.render('login', {page: page});
})

// Post route for new user registration
router.post('/register', upload.single('signature'), [
	check('email', 'Invalid Email').isEmail(), //check email format
	check('password', 'Password must be at least 6 characters long').isLength({min: 6}), //check password length
	check('password2').custom((value, { req }) => {  //ensure password confirmation matches
		if (value !== req.body.password) {
			throw new Error('Password confirmation does not match password');
		} else return value;
	}),
	check('secQ1').custom((value, { req }) => { //ensure security questions are not the same
		if (value === req.body.secQ2){
			throw new Error('Security questions must be different');
		} else return value;
	})
], function(req, res){

	const err = validationResult(req); //get the errors
	const { fName, lName, email, title, department, password, secQ1, secQ1Ans, secQ2, secQ2Ans } = req.body; //bring in body parameters 

	var mysql = req.app.get("mysql");
	mysql.pool.query('SELECT * FROM user WHERE email = ?', [email])
	.then(results => {
		var emailTaken = false;
		if(results.length > 0){ //ensure user email is not already registered
			emailTaken = true;
		}

		//if there is an error, display the error messages 
		if(!err.isEmpty() || emailTaken){ 
			var errors = err.array();
			if(emailTaken){ errors.push({msg: "Email is already registered"}) }; //we have to manually push in this error
			res.render('register', {
				errors: errors, 
				page: {title: 'Register'}
			});
		} else{
		
			//if there are no errors, then we can add all the user info into DB
			var mysql = req.app.get('mysql');
			var sql = "INSERT INTO user(fname, lName, email, password, title, department, secQ1, secQ1Ans, secQ2, secQ2Ans, signature) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
			var inserts = [fName, lName, email, password, title, department, secQ1, secQ1Ans, secQ2, secQ2Ans, req.file.path];
			sql = mysql.pool.query(sql, inserts, function(error, results, fields){
				if(error){
					console.log(JSON.stringify(error));
					res.write(JSON.stringify(error));
					res.end();
				} else{
                    req.flash('success', 'You have successfully registered! Please login to continue.')
					res.redirect('/login');
				}
			})
		}
	})
});



module.exports = router;