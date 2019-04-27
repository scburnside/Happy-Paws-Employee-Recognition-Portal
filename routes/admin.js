const express = require('express');
const router = express.Router();

// Route for Admin Main Menu
router.get('/adminmenu', function(req, res){
	var page = {
		title: "Admin Main Menu"
	}

	res.render('adminmenu', {page: page});
})

// Route for Manage User Accounts Page * Display Data
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

// Route to delete user
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
			req.flash('success', 'You have successfully deleted the user!')
			res.status(202).end();
		}
	})
})

// Post route for updating user information
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
			req.flash('success', 'User account has been updated')
			res.redirect('/users/admin/manageuseraccounts'); //Go back to manage user accounts to see update in table
			//res.status(202).end();
		}
	})
})



// Route for 1 User 
router.get('/edituseraccount/:id', function(req, res){
	var page = { title: "Edit User Account"}; 
	var mysql = req.app.get("mysql");
	var query = "SELECT * FROM user WHERE userId = ?";
	var inserts = [req.params.id];
	sql = mysql.pool.query(query, inserts, function(err, results, fields){
		if(err){
			console.log('err in display user table');
			next(err);
			return;}
	res.render('edituseraccount', 
		{page: page, 
		user:results[0]}); //Dispay error if no results returned - TODO
	});
})

// Route to Manage Admins page & Display Data
router.get('/manageadminaccounts', function(req, res){
	var page = { title: "Manage Admin Accounts"}; 
	var mysql = req.app.get("mysql");
	mysql.pool.query('SELECT * FROM admin', function(err, result){
		if(err){
			console.log('err in display admin table');
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
			req.flash('success', 'You have successfully deleted the admin!')
			res.status(202).end();
		}
	})
})


// Route for Analytics & Reporting
router.get('/analytics', function(req, res){
	var page = {
		title: "Analytics & Reporting"
	}

	res.render('analytics', {page: page});
})


module.exports = router;