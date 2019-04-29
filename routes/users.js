const express = require('express');
const router = express.Router();
const passport = require('passport');
const { check, validationResult } = require('express-validator/check'); //middleware for express-validator
const bcrypt = require('bcryptjs'); //middleware for encrypting pw
const routePermission = require(`../config/route_permissions.js`);
const multer = require('multer');
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

// Route to complete user registration (if new account created by admin)
router.get('/completeaccount', function(req, res){
	var page = {
		title: "Complete Registration"
	}

	res.render('completeuseraccount', {page: page});
})

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

// Post route for completing user registration
router.post('/completeaccount', upload.single('signature'), [
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
		fs.unlink(req.file.path, (er) => { // delete the signature file
			if(er){ console.log(err); }
			res.render('completeuseraccount', {
				errors: errors, 
				page: {title: 'Register'}
			});
		})
	} else{ //update user account to in DB
		bcrypt.genSalt(10, function(err, salt){ //first hash the new password
			bcrypt.hash(password, salt, function(err, hash){
				if(err){ console.log(err); }
				var mysql = req.app.get('mysql');
				var sql = "UPDATE user SET fname=?, lName=?, password=?, title=?, department=?, secQ1=?, secQ1Ans=?, secQ2=?, secQ2Ans=?, signature =?, accountComplete=? WHERE userId=?";
				var inserts = [fName, lName, hash, title, department, secQ1, secQ1Ans, secQ2, secQ2Ans, req.file.path, 0, req.user.userId];
				sql = mysql.pool.query(sql, inserts, function(error, results, fields){
					if(error){
						console.log(JSON.stringify(error));
						res.write(JSON.stringify(error));
						res.end();
					} else{
						req.flash('success', 'You have successfully completed your registration!')
						res.redirect('/users/usermainmenu');
					}
				})
			})
		})
	}
});

module.exports = router;