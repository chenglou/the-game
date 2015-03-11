
// user routes use users controller
var users = require('../controllers/users');


module.exports = function(app, passport) {

    app.get('/logout', users.signout);
    app.get('/users/me', users.me);
    app.post('/register', users.create);

    // Setting up the userId param
    app.param('userId', users.user);

    // AngularJS route to check for authentication
    app.get('/loggedin', function(req, res) {
        res.send(req.isAuthenticated() ? req.user : '0');
    });

    // Setting the local strategy route
    app.post('/login', passport.authenticate('local', { 
        failureFlash: 'Invalid username or password.' 
    }), function(req, res) {
        res.send({
            user: req.user
            //redirect: (req.user.roles.indexOf('admin') !== -1) ? req.get('referer') : req.body.redirect
        });
    });

    // Setting the facebook oauth routes
    app.get('/auth/facebook', passport.authenticate('facebook', {
        scope: ['email', 'user_about_me'],
        failureRedirect: '/!/login'
    }), users.signin);

    app.get('/auth/facebook/callback', passport.authenticate('facebook', {
        failureRedirect: '/!/login'
    }), users.authCallback); 
};