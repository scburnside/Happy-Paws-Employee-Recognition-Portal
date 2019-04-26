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
			//res.redirect('/users/admin/manageuseraccounts');	//Want to refresh the page
			res.status(202);
			//res.status(202).end();
		}
	})
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

/* 
router.post('/deleteuser', function(req, res, next){
	var id = req.body.userId
	var mysql = req.app.get("mysql");
	mysql.pool.query('DELETE FROM user WHERE userId = ?', [userId])
		if(error){
			console.log(JSON.stringify(error));
			res.write(JSON.stringify(error));
			res.end();
		} else{
			req.flash('success', 'You have successfully deleted the user!')
			res.redirect('/manageuseraccounts');	//Want to refresh the page
	}
}); */



module.exports = router;