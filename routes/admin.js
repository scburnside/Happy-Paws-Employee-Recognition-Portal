/* const express = require('express');
const router = express.Router(); */

const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check'); //middleware for express-validator
const multer  = require('multer')
const upload = multer()
const bcrypt = require('bcryptjs');
const passport = require('passport');
//const routePermission = require(`../config/route_permissions.js`);
//const fs = require('fs');

/* // Middleware setup for multer
const storage = multer.diskStorage({
	destination: function(req, file, cb){
		cb(null, './public/signatures'); // specify storage location for user signature images
	},
	filename: function(req, file, cb){
		cb(null, Date.now() +  file.originalname); // specify file name to give signature
	}
}) */

/* // Filter file setup for storing signatures
const fileFilter = function(req, file, cb){
	if(file.mimetype === 'image/png' || file.mimetype === 'image/jpeg'){ //store only jpeg and png images, reject all others 
		cb(null, true);
	} else {
		cb(null, false);
	}
}

const upload = multer({storage: storage, fileFilter: fileFilter}); */


// Route to render the Admin Main Menu
router.get('/adminmenu', function(req, res){
	var page = {
		title: "Admin Main Menu"
	}

	res.render('adminmenu', {page: page});
})

// Route for Manage User Accounts Page & Display Data
router.get('/manageuseraccounts', function(req, res){
	var page = { title: "Manage User Accounts"}; 
	var mysql = req.app.get("mysql");
	mysql.pool.query('SELECT * FROM user', function(err, result){
		if(err){
			console.log('err in display user table');
			next(err);
			return;}
	res.render('manageuseraccounts', 
		{page: page, 
		users:result});
	});
})

// Route to Delete User (Manage User Accounts)
router.delete('/manageuseraccounts/:id', function(req, res){
	var mysql = req.app.get('mysql');
	var sql = "DELETE from user WHERE userId = ?";
	var inserts = [req.params.id];
	sql = mysql.pool.query(sql, inserts, function(error, results, fields){
		if(error){
			console.log(JSON.stringify(error));
			res.write(JSON.stringify(error));
			//res.status(400);
			res.end();
		}else{
			req.flash('success', 'You Have Successfully Deleted The User!')
			res.status(202).end();
		}
	})
})

// Post Route for Updating User Information (Manage User Accounts)
router.post('/edituseraccount/:id', function(req, res){
	const { fName, lName, title, department } = req.body; //bring in body parameters
	var mysql = req.app.get('mysql');
	var query = "UPDATE user SET fName=?, lName=?, title=?, department=? WHERE userId=?";
	var inserts = [fName, lName, title, department, req.params.id];
	sql = mysql.pool.query(query, inserts, function(err, results, fields){
		if(err){
			console.log(JSON.stringify(error));
			res.write(JSON.stringify(error));
			res.end();
		}else{
			req.flash('success', 'The User Account Has Been Updated!')
			res.redirect('/users/admin/manageuseraccounts'); //Go back to manage user accounts to see update in table
			//res.status(202).end();
		}
	})
})


// Route for 1 User (To Update User Info)
router.get('/edituseraccount/:id', function(req, res){
	var page = { title: "Edit User Account"}; 
	var mysql = req.app.get("mysql");
	var query = "SELECT * FROM user WHERE userId = ?";
	var inserts = [req.params.id];
	sql = mysql.pool.query(query, inserts, function(err, results, fields){
		if(err){
			console.log('Error in Updating the User Table');
			next(err);
			return;}
	res.render('edituseraccount', 
		{page: page, 
		user:results[0]}); //Dispay error if no results returned - TODO
	});
})

// Get Route to Create New User Accounts
router.get('/createuseraccount', function(req, res){
	var page = {
		title: "Create New User Accounts"
	}

	res.render('createuseraccount', {page: page});
})

// Post route for Creating New User Account
router.post('/createuseraccount', upload.none(), [
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
			//fs.unlink(req.file.path, (er) => {
				//if(er){ console.log(err); }
				res.render('createuseraccount', {
					errors: errors, 
					page: {title: 'Create New User Account'}
				});
			//})
		} else{
		
			// if there are no errors, then we can add all the user info into DB
			// first we need to hash pw before storing in DB
			bcrypt.genSalt(10, function(err, salt){
				bcrypt.hash(password, salt, function(err, hash){
					if(err){ console.log(err); }
					var mysql = req.app.get('mysql');
					var sql = "INSERT INTO user(fname, lName, email, password, title, department, secQ1, secQ1Ans, secQ2, secQ2Ans) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
					var inserts = [fName, lName, email, hash, title, department, secQ1, secQ1Ans, secQ2, secQ2Ans];
					sql = mysql.pool.query(sql, inserts, function(error, results, fields){
						if(error){
							console.log(JSON.stringify(error));
							res.write(JSON.stringify(error));
							res.end();
						} else{
							req.flash('success', 'You have successfully created a new user account!')
							res.redirect('/users/admin/manageuseraccounts');
							res.status(202).end();
						}
					})
				})
			})
		}
	})
}); 


// Route to Manage Admins Page & Display Data
router.get('/manageadminaccounts', function(req, res){
	var page = { title: "Manage Admin Accounts"}; 
	var mysql = req.app.get("mysql");
	mysql.pool.query('SELECT * FROM admin', function(err, result){
		if(err){
			console.log('Error in Display Admin Table');
			next(err);
			return;}
	res.render('manageadminaccounts', 
		{page: page, 
		admins:result});
	});
})

// Route to Delete an Admin
router.delete('/manageadminaccounts/:id', function(req, res){
	var mysql = req.app.get('mysql');
	var sql = "DELETE from admin WHERE adminId = ?";
	var inserts = [req.params.id];
	sql = mysql.pool.query(sql, inserts, function(error, results, fields){
		if(error){
			console.log(JSON.stringify(error));
			res.write(JSON.stringify(error));
			//res.status(400);
			res.end();
		}else{
			req.flash('success', 'You Have Successfully Deleted the Admin!')
			res.status(202).end();
		}
	})
})

// Post route for Updating Admin Information
router.post('/editadminaccount/:id', function(req, res){
	const { userName, title, department } = req.body; //bring in body parameters
	var mysql = req.app.get('mysql');
	var query = "UPDATE admin SET userName=?, title=?, department=? WHERE adminId=?";
	var inserts = [userName, title, department, req.params.id];
	sql = mysql.pool.query(query, inserts, function(err, results, fields){
		if(err){
			console.log(JSON.stringify(error));
			res.write(JSON.stringify(error));
			res.end();
		}else{
			req.flash('success', 'Admin Account Has Been Updated!')
			res.redirect('/users/admin/manageadminaccounts'); //Go back to manage user accounts to see update in table
			//res.status(202).end();
		}
	})
})


// Route for 1 Admin (to Update Admin Info)
router.get('/editadminaccount/:id', function(req, res){
	var page = { title: "Edit Admin Account"}; 
	var mysql = req.app.get("mysql");
	var query = "SELECT * FROM admin WHERE adminId = ?";
	var inserts = [req.params.id];
	sql = mysql.pool.query(query, inserts, function(err, results, fields){
		if(err){
			console.log('Error in Display Admin Table');
			next(err);
			return;}
	res.render('editadminaccount', 
		{page: page, 
		admin:results[0]}); //Dispay error if no results returned - TODO
	});
})




// Route for Analytics & Reporting
router.get('/analytics', function(req, res){
	var page = {
		title: "Analytics & Reporting"
	}

	res.render('analytics', {page: page});
})


module.exports = router;