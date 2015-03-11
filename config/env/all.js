'use strict';

var path = require('path');
var rootPath = path.normalize(__dirname + '/../..');

module.exports = {
	root: rootPath,
	port: process.env.PORT || 3000,
	templateEngine: 'swig',

	// The secret should be set to a non-guessable string that
	// is used to compute a session hash
	sessionSecret: 'THEGAME',
	// The name of the MongoDB collection to store sessions in
	sessionCollection: 'sessions',

	  // The session cookie settings
	sessionCookie: {
		path: '/',
		httpOnly: true,
		// If secure is set to true then it will cause the cookie to be set
		// only when SSL-enabled (HTTPS) is used, and otherwise it won't
		// set a cookie. 'true' is recommended yet it requires the above
		// mentioned pre-requisite.
		secure: false,
		// Only set the maxAge to null if the cookie shouldn't be expired
		// at all. The cookie will expunge when the browser is closed.
		maxAge: null
	},

	// The session cookie name
	sessionName: 'connect.sid',

	db: 'mongodb://localhost/thegame',
    app: {
        name: 'THEGAME'
    },
    facebook: {
        clientID: '152340601610394',
        clientSecret: '1e9a0112d44a4d8a4f6d4e4fc5fdf7b8',
        callbackURL: 'http://localhost:3000/auth/facebook/callback'
    }
};
