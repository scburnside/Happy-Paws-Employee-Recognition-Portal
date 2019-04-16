const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check'); //middleware for express-validator

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
router.post('/register', [
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

	//if there is an error, display the error messages 
	if(!err.isEmpty()){ 
		var errors = err.array();
		res.render('register', {
			errors: errors, 
			page: {title: 'Register'}
		});
	} else{
	
		//if no error, add all the user info into DB
		var mysql = req.app.get('mysql');
		var sql = "INSERT INTO user(fname, lName, email, password, title, department, secQ1, secQ1Ans, secQ2, secQ2Ans) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
		var inserts = [fName, lName, email, password, title, department, secQ1, secQ1Ans, secQ2, secQ2Ans];
		sql = mysql.pool.query(sql, inserts, function(error, results, fields){
			if(error){
				console.log(JSOM.stringify(error));
				res.write(JSON.stringify(error));
				res.end();
			} else{
				res.redirect('/users/login');
			}
		})
	}
});


module.exports = router;