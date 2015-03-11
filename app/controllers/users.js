'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    _ = require('mori');


function generate_random_password(length, allowed_chars) {   
    //Returns a random string of length characters from the set of a-z, A-Z, 0-9.
    length = typeof length !== 'undefined' ? length : 12;
    allowed_chars = typeof allowed_chars !== 'undefined' ? allowed_chars : 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';


    var pass = "";
    for (var x = 0; x < length; x++) {
        var i = Math.floor(Math.random(length));
        pass += allowed_chars.charAt(i);
    }
    return pass;
}
        
/**
 * Auth callback
 */
exports.authCallback = function(req, res) {
    res.redirect('/');
};

/**
 * Show login form
 */
exports.signin = function(req, res) {
    if(req.isAuthenticated()) {
        return res.redirect('/');
    }
    res.redirect('/!/login');
};

/**
 * Logout
 */
exports.signout = function(req, res) {
    req.logout();
    res.redirect('/');
};

/**
 * Session
 */
exports.session = function(req, res) {
    res.redirect('/');
};

/**
 * Create user
 */
exports.create = function(req, res, next) {
    var user = new User(req.body);
    user.provider = 'local';

    // because we set our user.provider to local our models/user.js validation will always be true
    req.assert('email', 'You must enter a valid email address').isEmail();
    req.assert('password', 'Password must be between 8-20 characters long').len(8, 20);
    req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).send(errors);
    }

    // Hard coded for now. Will address this with the user permissions system in v0.3.5
    user.save(function(err) {
        if (err) {
            switch (err.code) {
                case 11000:
                case 11001:
                    res.status(400).send('Email already taken');
                    break;
                default:
                    res.status(400).send('Please fill all the required fields');
            }

            return res.status(400);
        }
        req.logIn(user, function(err) {
            if (err) return next(err);
            return res.jsonp(user);
        });
        res.status(200);
    });
};
/**
 * Send User
 */
exports.me = function(req, res) {
    console.log(req.user);
    res.jsonp(req.user || null);
};

/**
 * Find user by id
 */
exports.user = function(req, res, next, id) {
    User
        .findOne({
            _id: id
        })
        .exec(function(err, user) {
            if (err) return next(err);
            if (!user) return next(new Error('Failed to load User ' + id));
            req.profile = user;
            next();
        });
};


/**
 * Update a User
 */
exports.update = function(req, res) {
    var user = req.user;
    user = _.merge(user, req.body);
    user.save(function(err) {
        if (err) {
            res.send(401);
            return;
        } else {
            res.jsonp(user);
        }
    });
};


/**
 *  Create a random user with only emails, return the newly created user or the existing one
 */
exports.createWithEmail = function(email, callback) {
    User.findOne({
        email: email
    })
    .exec(function (err, user) {
        if (err || !user) {
            // create new user
            var new_user = {
                email: email,
                password: generate_random_password()
            }
            var u = new User(new_user);
            u.save(function (err, user) {
                if (err) return callback(err, null);
                return callback(err, user);
            });
        }
        else
        {
            // user exist
            return callback(null, user);
        }
    });
};
