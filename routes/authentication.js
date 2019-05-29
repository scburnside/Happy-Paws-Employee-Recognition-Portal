const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check'); //middleware for express-validator
const multer = require('multer');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const routePermission = require(`../config/route_permissions.js`);
const fs = require('fs');

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
router.get('/', routePermission.redirectMainMenu, function(req, res){
	var page = {
		title: "Home"
	};

	res.render('home', {page: page});
});

// Route for user registration
router.get('/register', routePermission.redirectMainMenu, function(req, res){
	var page = {
		title: "Register"
	}

	res.render('register', {page: page});
})

// Route for user login
router.get('/login', routePermission.redirectMainMenu, function(req, res){
	var page = {
		title: "Login"
	}

	res.render('login', {page: page});
})

// Handler for Logout
router.get('/logout', function(req, res, next){
	req.logout();
	req.flash('success', 'You have sucessfully logged out');
	res.redirect('/login');

})

// Test route --RMR TO DELETE!!!
router.get('/homepage', function(req, res){
	console.log(req.user)
	res.send('You are logged in!');
})

// Get Route for Forgotten Password
router.get('/forgotpw', routePermission.redirectMainMenu, function(req, res){
	var page = {
		title: "Forgot Pw"
	}

	res.render('forgotpw', {page: page});
})

// Post Route to find account to reset password
router.post('/forgotpw', routePermission.redirectMainMenu, function(req, res){
	const { email, isAdmin } = req.body; //bring in body parameters
	if(isAdmin){ //if user is in admin then we will search the admin table
		var mysql = req.app.get("mysql");
		mysql.pool.query('SELECT * FROM admin WHERE userName = ?', [email], function(err, results){
			if(err){ console.log(err); }
			if(results.length > 0){ //if the account exists, proceed to resetting pw
				var page = {
					title: "Forgot Pw"
				}
				var user_data = results[0];
				res.render('confirmsq', {page, user_data});
			} else { //if account does not exist, display error
				req.flash('warning', 'No admin account associated with that username.')
				res.redirect('/forgotpw');
			}
		})
	} else{ //if user is not an admin then we will search the user table
		var mysql = req.app.get("mysql");
		mysql.pool.query('SELECT * FROM user WHERE email = ?', [email], function(err, results){
			if(err){ console.log(err); }
			if(results.length > 0){ //if the account exists, proceed to resetting pw
				var page = {
					title: "Confirm you Account"
				}
				var user_data = results[0];
				res.render('confirmsq', {page, user_data});
			} else { //if account does not exist, display error
				req.flash('warning', 'No user account associated with that email.')
				res.redirect('/forgotpw');
			}
		})
	}
})

// Post route to confirm security question for forgotten pw
router.post('/confirmsq', function(req, res){
	//check to confirm answer to security question is correct
	const { secQ1Ans, secQ2Ans, trueAns1, trueAns2, adminId, userId, isAdmin } = req.body; //bring in body parameters
	if((secQ1Ans == trueAns1) && (secQ2Ans == trueAns2)){ //if user answered seq question correctly, then proceed to resetting password
		var page = {
			title: "Reset PW"
		}
		res.render('resetpw', {page, user_data: req.body});
	} else {
		req.flash('warning', 'Incorrect answer.')
		res.redirect('/forgotpw');
	}
})

// Post route to reset forgotten pw to new pw
router.post('/resetpw', [
	check('password', 'Password must be between 6-30 characters long').isLength({min: 6, max: 30}), //check new password length
	check('password2').custom((value, { req }) => {  //ensure password confirmation matches
		if (value !== req.body.password) {
			throw new Error('Password confirmation does not match password');
		} else return value;
	}),
], function(req, res){
	const err = validationResult(req); //get the errors
	//if there is an error, display the error messages 
	if(!err.isEmpty()){ 
		var errors = err.array();
		return res.render('resetpw', {
			errors: errors, 
			page: {title: 'Reset PW'},
			user_data: req.body
		});
	}

	//encrypt new password
	bcrypt.genSalt(10, function(err, salt){
		bcrypt.hash(req.body.password, salt, function(err, hash){
			if(err){ console.log(err); }
			if(req.body.isAdmin == 1){ //if this is an admin user, update admin password
				var mysql = req.app.get('mysql');
				var query = "UPDATE admin SET password=? WHERE adminId=?";
				var inserts = [hash, req.body.adminId];
				sql = mysql.pool.query(query, inserts, function(err, results, fields){
					if(err){
						res.write(JSON.stringify(error));
						res.end();
					}else{
						req.flash('success', 'Your password has been successfully reset. Sign in to continue.')
						res.redirect('/login');
					}
				})
			} else{ //if this is a normal user, update user password
				var mysql = req.app.get('mysql');
				var query = "UPDATE user SET password=? WHERE userId=?";
				var inserts = [hash, req.body.userId];
				sql = mysql.pool.query(query, inserts, function(err, results, fields){
					if(err){
						res.write(JSON.stringify(error));
						res.end();
					}else{
						req.flash('success', 'Your password has been successfully reset. Sign in to continue.')
						res.redirect('/login');
					}
				})
			}
		})
	})
})

// Post route for new user registration
router.post('/register', upload.single('signature'), [
	check('email', 'Invalid Email').isEmail(), //check email format
	check('password', 'Password must be between 6-30 characters long').isLength({min: 6, max: 30}), //check password length
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
			fs.unlink(req.file.path, (er) => {
				if(er){ console.log(err); }
				res.render('register', {
					errors: errors, 
					page: {title: 'Register'}
				});
			})
		} else{
		
			// if there are no errors, then we can add all the user info into DB
			// first we need to hash pw before storing in DB
			bcrypt.genSalt(10, function(err, salt){
				bcrypt.hash(password, salt, function(err, hash){
					if(err){ console.log(err); }
					var mysql = req.app.get('mysql');
					var sql = "INSERT INTO user(fname, lName, email, password, title, department, secQ1, secQ1Ans, secQ2, secQ2Ans, signature) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
					var inserts = [fName, lName, email, hash, title, department, secQ1, secQ1Ans, secQ2, secQ2Ans, req.file.path];
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
				})
			})
		}
	})
});

// Post route for login
router.post('/login', function(req, res, next){
	if(req.body.isAdmin){
		passport.authenticate('local', {
			successRedirect: '/users/admin/adminmenu',
			failureRedirect: '/login', 
			failureFlash: true
		})(req, res, next);
	} else{
		passport.authenticate('local', {
			successRedirect: '/users/usermainmenu',
			failureRedirect: '/login', 
			failureFlash: true
		})(req, res, next);
	}
});


module.exports = router;
