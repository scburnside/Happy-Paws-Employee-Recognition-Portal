const express = require('express');
const router = express.Router();
const passport = require('passport');
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
		title: "View Awards Given"
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

module.exports = router;