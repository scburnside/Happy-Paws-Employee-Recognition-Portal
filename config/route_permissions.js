module.exports ={
    ensureAdmin: function(req, res, next){
        if(req.isAuthenticated()){
            if(req.user.isAdmin){
                if(req.user.newAccount == 0){
                    return next();
                } else{
                    req.flash('warning', "You must complete your registration before you can proceed.");
                    res.redirect('/users/admin/completeaccount');
                    return;
                }
            }else{
                req.flash('warning', 'Access denied. You are not an admin.');
                res.redirect('/users/usermainmenu');
                return;
            }
        }
        req.flash('warning', 'Access denied. Please login as an admin.');
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
                req.flash('warning', "Access denied. You are not a user.");
                res.redirect('/users/admin/adminmenu');
                return;
            }
        }
        req.flash('warning', 'Access denied. Please login.');
        res.redirect('/login');
    },
    isComplete: function(req, res, next){
        if(req.isAuthenticated()){
            if(req.user.isAdmin && req.user.newAccount){
                return next();
            } else if(!req.user.isAdmin && req.user.accountComplete){
                return next();
            }
        }

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