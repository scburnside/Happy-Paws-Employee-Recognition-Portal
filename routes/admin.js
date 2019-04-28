/* const express = require('express');
const router = express.Router(); */

const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check'); //middleware for express-validator
const multer  = require('multer')
const upload = multer()
const bcrypt = require('bcryptjs');
const passport = require('passport');

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
		title: "Create New User Account"
	}

	res.render('createuseraccount', {page: page});
})

// Post route for Creating New User Account
router.post('/createuseraccount', upload.none(), [
	check('email', 'Invalid Email').isEmail(), //check email format
], function(req, res){

	const err = validationResult(req); //get the errors
	const { fName, lName, email, password} = req.body; //bring in body parameters 

	var mysql = req.app.get("mysql");
	mysql.pool.query('SELECT * FROM user WHERE email = ?', [email])
	.then(results => {
		var emailTaken = false;
		if(results.length > 0){ //Ensure user email is not already registered
			emailTaken = true;
		}
		//if there is an error, display the error messages 
		if(!err.isEmpty() || emailTaken){ 
			var errors = err.array();
			if(emailTaken){ errors.push({msg: "Email is already registered"}) }; //we have to manually push in this error
				res.render('createuseraccount', {
					errors: errors, 
					page: {title: 'Create New User Account'}
				});
			//})
		} else{
			// if there are no errors, then we can add all the user info into DB
			// First we hardcode a temp password
			const password = 'hpaws' + lName;   
			// Then we need to hash pw before storing in DB
			bcrypt.genSalt(10, function(err, salt){
				bcrypt.hash(password, salt, function(err, hash){
					if(err){ console.log(err); }
					var mysql = req.app.get('mysql');
					var sql = "INSERT INTO user(fname, lName, email, password, accountComplete) VALUES (?, ?, ?, ?,'1')"; //AccountComplete flag needs to be set to 1
					var inserts = [fName, lName, email, hash];
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

// Get Route to Create New Admin Accounts
router.get('/createadminaccount', function(req, res){
	var page = {
		title: "Create New Admin Account"
	}

	res.render('createadminaccount', {page: page});
})

// Post route for Creating New Admin Account
router.post('/createadminaccount', upload.none(), [], function(req, res){

	const err = validationResult(req); //get the errors
	const { userName, password} = req.body; //bring in body parameters 

	var mysql = req.app.get("mysql");
	mysql.pool.query('SELECT * FROM admin WHERE userName = ?', [userName])
	.then(results => {
		var userNameTaken = false;
		if(results.length > 0){ //Ensure user name is not already registered
			userNameTaken = true;
		}
		//if there is an error, display the error messages 
		if(!err.isEmpty() || userNameTaken){ 
			var errors = err.array();
			if(userNameTaken){ errors.push({msg: "That Username is Already Registered!"}) }; //we have to manually push in this error
				res.render('createadminaccount', {
					errors: errors, 
					page: {title: 'Create New User Account'}
				});
			//})
		} else{
			// if there are no errors, then we can add all the user info into DB
			// First we hardcode a temp password
			const password = 'hpaws' + userName;   
			// Then we need to hash pw before storing in DB
			bcrypt.genSalt(10, function(err, salt){
				bcrypt.hash(password, salt, function(err, hash){
					if(err){ console.log(err); }
					var mysql = req.app.get('mysql');
					var sql = "INSERT INTO admin(userName, password, newAccount) VALUES (?, ?,'1')"; //newAccount flag needs to be set to 1
					var inserts = [userName, hash];
					sql = mysql.pool.query(sql, inserts, function(error, results, fields){
						if(error){
							console.log(JSON.stringify(error));
							res.write(JSON.stringify(error));
							res.end();
						} else{
							req.flash('success', 'You Have Successfully Created a New Admin Account!')
							res.redirect('/users/admin/manageadminaccounts');
							res.status(202).end();
						}
					})
				})
			})
		}
	})
}); 



// Route for Analytics & Reporting
router.get('/analytics', function(req, res){
	var page = {
		title: "Analytics & Reporting"
	}

	res.render('analytics', {page: page});
})


module.exports = router;