const express = require('express');
const router = express.Router();

router.get('/usermainmenu', function(req, res){
	var page = {
		title: "User Home"
	}

	res.render('userMainMenu', {page: page});
})

// Route for user profile
router.get('/usermyprofile', function(req, res){
	var page = {
		title: "My Profile"
	}

	res.render('usermyprofile', {page: page});
})

// Route for user to create an award for another person.
router.get('/usercreateaward', function(req, res){
	var page = {
		title: "Create An Award"
	}

	res.render('usercreateaward', {page: page});
})

// Route for user to view previous awards given by him.
router.get('/userviewawards', function(req, res){
	var page = {
		title: "View Awards Given"
	}

	res.render('userviewawards', {page: page});
})


// Route for user to reset users password
router.get('/userresetpassword', function(req, res){
	var page = {
		title: "View Awards Given"
	}

	res.render('userresetpassword', {page: page});
})

// Route for user update their profile
router.get('/usereditprofile', function(req, res){
	var page = {
		title: "View Awards Given"
	}

	res.render('usereditprofile', {page: page});
})

module.exports = router;