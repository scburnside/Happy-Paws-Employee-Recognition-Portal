const express = require('express');
const router = express.Router();

// Route for user registration
router.get('/register', function(req, res){
	var page = {
		title: "Register"
	}

	res.render('register', {page: page});
})


module.exports = router;