const express = require('express');
const router = express.Router();

// Route for Admin Main Menu
router.get('/adminmenu', function(req, res){
	var page = {
		title: "Admin Main Menu"
	}

	res.render('adminmenu', {page: page});
})

// Route for Manage User Accounts
router.get('/manageuseraccounts', function(req, res){
	var page = {
		title: "Manage User Accounts"
	}

	res.render('manageuseraccounts', {page: page});
})


// Route for Manage Admin Accounts
router.get('/manageadminaccounts', function(req, res){
	var page = {
		title: "Manage Admin Accounts"
	}

	res.render('manageadminaccounts', {page: page});
})


// Route for Analytics & Reporting
router.get('/analytics', function(req, res){
	var page = {
		title: "Analytics & Reporting"
	}

	res.render('analytics', {page: page});
})



module.exports = router;