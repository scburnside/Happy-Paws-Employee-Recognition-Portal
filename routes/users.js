const express = require('express');
const router = express.Router();
const passport = require('passport');
const { check, validationResult } = require('express-validator/check'); //middleware for express-validator
const bcrypt = require('bcryptjs'); //middleware for encrypting pw
const routePermission = require(`../config/route_permissions.js`);
const multer = require('multer');
const fs = require('fs');
const proj_dir = require('path').join(__dirname, '../'); //get the project dir file path
const generateAward = require('../config/awardConfig/generateAward.js');
const sendAward = require('../config/emailcon.js');

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
router.get('/completeaccount', routePermission.isComplete, function(req, res){
	var page = {
		title: "Complete Registration"
	}

	res.render('completeuseraccount', {page: page});
})

router.get('/usermainmenu', routePermission.ensureUser, function(req, res){
	var page = {
		title: "Main Menu"
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

// Post route for created awards
router.post('/useraddaward', routePermission.ensureUser, function(req, res){
	const { awardType, to_fName, to_lName, to_email } = req.body; //bring in body parameters
	var mysql = req.app.get('mysql');
	var query = "INSERT INTO award (awardType, fromWhom, to_fName, to_lName, to_email) VALUES (?,?,?,?,?)";
	var inserts = [awardType, req.user.userId, to_fName, to_lName, to_email];
	sql = mysql.pool.query(query,inserts, function(err, results, fields){
		if(err){
			res.write(JSON.stringify(err));
			console.log("error in MySQL");
			res.end();
		}else{
			//store all award details in an object
			var awardInfo = {
				awardId: results.insertId,
				awardType: awardType,
				to_email: to_email,
				to_name: to_fName + " " + to_lName,
				to_lName: to_lName,
				from_name: req.user.fName + " " + req.user.lName,
				from_title: req.user.title,
				userSig: (proj_dir + req.user.signature).replace(/\\/g,"/")
			}
			createAward(req, awardInfo, function(){
				req.flash('success', 'Award has been successfully created and sent to the email provided!');
			 	res.redirect('/users/userviewawards');
			});		
		}
	})
})

// This is the driver function to create an award and then send it to the recipient's email
function createAward(req, awardInfo, cb){
	//first get the date the award was created and store it in the awardInfo object
	var mysql = req.app.get('mysql');
	var query = "SELECT DATE_FORMAT(dateCreated, '%b-%d-%Y') AS 'dateCreated'  FROM award WHERE awardId = ?";
	var inserts = [awardInfo.awardId];
	var sql = mysql.pool.query(query,inserts, function(err, results, fields){
		if(err){
			res.write(JSON.stringify(err));
			console.log("error in MySQL");
			res.end(); 
		} else{
			awardInfo.createdDate = results[0].dateCreated;
			// call function to generate the pdf award certificate using latex
			generateAward(awardInfo, function(){
				//Once award generation is complete, call function to send the pdf certificate to the recipient's email
				sendAward(awardInfo, function(err){
					if(err){ console.log(err); }
					else { 
						// we're all done and now we call the callback function
						//console.log("Email sent!");
						cb();
					 }
				});
			});
		}
	})
}

// Route for user to create an award for another person.
router.get('/usercreateaward', routePermission.ensureUser, function(req, res){
	var page = { title: "Create An Award" }
	res.render('usercreateaward', {page: page});
})


// Route to Delete Users given award
router.delete('/deleteAward/:id', routePermission.ensureUser, function(req, res){
	var mysql = req.app.get('mysql');
	var sql = "DELETE from award WHERE awardId = ?";
	var inserts = [req.params.id];
	sql = mysql.pool.query(sql, inserts, function(error, results, fields){
		if(error){
			console.log(JSON.stringify(error));
			res.write(JSON.stringify(error));
			//res.status(400);
			res.end();
		}else{
			req.flash('success', 'You Have Successfully Deleted The Award!')
			res.status(202).end();
		}
	})
})

// Route for user to view previous awards given by him.
router.get('/userviewawards', routePermission.ensureUser, function(req, res){
	var page = { title: "View Awards Given" }
	var mysql = req.app.get("mysql");
	var query = "SELECT awardId, awardType, to_fName, to_lName, to_email, DATE_FORMAT(dateCreated, '%b-%d-%Y') AS 'dateCreated'  FROM award WHERE fromWhom = ?";
	var inserts = [req.user.userId];
	var sql = mysql.pool.query(query, inserts, function(err, results, fields){
		if(err){
			console.log('Error in retrieving from awardGiven Table');
			return next(err);
		}
		res.render('userviewawards', 
			{page: page, 
			user_awards: results});
	});
})


// Route for user to reset users password
router.get('/userresetpassword', routePermission.ensureUser, function(req, res){
	var page = {
		title: "Change Password"
	}
	res.render('userresetpassword', {page: page});
})

// Post route for updating user profile
router.post('/usereditprofile', routePermission.ensureUser, [
	check('fName', 'First Name must be less than 30 characters long').isLength({max: 30}), //fName length
    check('lName', 'Last Name must be less than 30 characters long').isLength({max: 30}), //lName length
],
function(req, res){
	const err = validationResult(req); //get the errors
	const { fName, lName, title, department } = req.body; //bring in body parameters
	if(!err.isEmpty()){ 
		var errors = err.array();
		res.render('usereditprofile', {
			errors: errors, 
			page: {title: 'Edit Profile'}
		});
    } else{
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
	}
})

// Post route for changing user password 
router.post('/userresetpassword', routePermission.ensureUser, [
	check('newpassword', 'New password must be between 6-30 characters long').isLength({min: 6, max: 30}), //check new password length
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
			req.flash('warning', 'Old password is incorrect.');
			res.redirect('/users/userresetpassword');
		}
	})

})

// Post route for completing user registration
router.post('/completeaccount', upload.single('signature'), [
	check('fName', 'First Name must be less than 30 characters long').isLength({max: 30}), //fName length
	check('lName', 'Last Name must be less than 30 characters long').isLength({max: 30}), //lName length
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