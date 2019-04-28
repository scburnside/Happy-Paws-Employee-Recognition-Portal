const express = require('express');
const router = express.Router();
const passport = require('passport');
const { check, validationResult } = require('express-validator/check'); //middleware for express-validator
const bcrypt = require('bcryptjs'); //middleware for encrypting pw
const routePermission = require(`../config/route_permissions.js`);

router.get('/usermainmenu', routePermission.ensureUser, function(req, res){
	var page = {
		title: "User Home"
	}

	res.render('userMainMenu', {page: page});
})

// Route for user profile
router.get('/usermyprofile', routePermission.ensureUser, function(req, res){
	var page = {
		title: "My Profile"
	}

	res.render('usermyprofile', {
		page: page,
		sig_url: "http://localhost:3000/" + req.user.signature
	});
})

// Route for user update their profile
router.get('/usereditprofile', routePermission.ensureUser, function(req, res){
	var page = {
		title: "Edit Profile"
	}

	res.render('usereditprofile', {page: page});
})

// Route for user to create an award for another person.
router.get('/usercreateaward', routePermission.ensureUser, function(req, res){
	var page = {
		title: "Create An Award"
	}

	res.render('usercreateaward', {page: page});
})

// Route for user to view previous awards given by him.
router.get('/userviewawards', routePermission.ensureUser, function(req, res){
	var page = {
		title: "View Awards Given"
	}

	res.render('userviewawards', {page: page});
})


// Route for user to reset users password
router.get('/userresetpassword', routePermission.ensureUser, function(req, res){
	var page = {
		title: "Change Password"
	}
	res.render('userresetpassword', {page: page});
})

// Post route for updating user profile
router.post('/usereditprofile', routePermission.ensureUser, function(req, res){
	const { fName, lName, title, department } = req.body; //bring in body parameters
	var mysql = req.app.get('mysql');
	var query = "UPDATE user SET fName=?, lName=?, title=?, department=? WHERE userId=?";
	var inserts = [fName, lName, title, department, req.user.userId];
	sql = mysql.pool.query(query, inserts, function(err, results, fields){
		if(err){
			res.write(JSON.stringify(error));
			res.end();
		}else{
			req.flash('success', 'Your profile has been updated')
			res.redirect('/users/usermyprofile');
		}
	})
})

// Post route for changing user password
router.post('/userresetpassword', routePermission.ensureUser, [
	check('newpassword', 'New password must be at least 6 characters long').isLength({min: 6}), //check new password length
	check('password2').custom((value, { req }) => {  //ensure password confirmation matches
		if (value !== req.body.newpassword) {
			throw new Error('Password confirmation does not match new password');
		} else return value;
	}),
], function(req, res){
	const error = validationResult(req); //get the errors
	const { oldpassword, newpassword, password2 } = req.body; //bring in body parameters

	//Check if old password matches current set pw
	bcrypt.compare(oldpassword, req.user.password, function(err, isMatch){
		if(err) throw err;

		if(isMatch){ //if old password matches, update new password if valid
			if(!error.isEmpty()){ //check for invalid new passwrod
				var errors = error.array();
				return res.render('userresetpassword', {
					errors: errors, 
					page: {title: 'Change Password'},
				});
			} else{ //update to password to user account
				bcrypt.genSalt(10, function(err, salt){ //first encrypt new password
					bcrypt.hash(newpassword, salt, function(err, hash){
						if(err){ console.log(err); }
						var mysql = req.app.get('mysql');
						var query = "UPDATE user SET password=? WHERE userId=?";
						var inserts = [hash, req.user.userId];
						sql = mysql.pool.query(query, inserts, function(err, results, fields){
							if(err){
								res.write(JSON.stringify(error));
								res.end();
							}else{
								req.flash('success', 'Your password has been successfully updated.')
								res.redirect('/users/usermyprofile');
							}
						})
					})
				})
			} 
		} else{ //if it does not match
			req.flash('danger', 'Old password is incorrect.');
			res.redirect('/users/userresetpassword');
		}
	})

})

module.exports = router;