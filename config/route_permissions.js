module.exports ={
    ensureAdmin: function(req, res, next){
        if(req.isAuthenticated()){
            if(req.user.isAdmin){
                return next();
            }else{
                req.flash('danger', 'Must be logged in as an admin to go there!');
                res.redirect('/users/usermainmenu');
                return;
            }
        }
        req.flash('danger', 'Must be logged in as an admin!');
        res.redirect('/login');
    },
    ensureUser: function(req, res, next){
        if(req.isAuthenticated()){
            if(!req.user.isAdmin){
                if(req.user.accountComplete == 0){
                    return next();
                } else{
                    req.flash('warning', "You must complete your registration before you can proceed.");
                    res.redirect('/users/completeaccount');
                    return;
                }
            }else{
                req.flash('danger', "Admins can't go there!");
                res.redirect('/users/admin/adminmenu');
                return;
            }
        }
        req.flash('danger', 'Must be logged in as a user!');
        res.redirect('/login');
    },
    redirectMainMenu: function(req, res, next){
        if(!req.isAuthenticated()){
            return next();
        }

        if(req.user.isAdmin){
            res.redirect('/users/admin/adminmenu');
        }else{
            res.redirect('/users/usermainmenu');
        }
    }
};