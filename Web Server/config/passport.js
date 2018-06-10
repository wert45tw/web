// config/passport.js

// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;
var request = require('request');

// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        var data = JSON.parse('{ "id": "'+id+'"}');
        request({
            url : "http://localhost:8888/api/selectid",
            method : "POST",
            json: true,
            body : data
        }, function(error, response, body){
            return done(null, body.message_content);
        });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

        passport.use(
        'local-signup',
        new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) {
            var data = JSON.parse('{ "username": "'+username+'", "password": "'+password+'"}');
            request({
                url : "http://localhost:8888/api/signup",
                method : "POST",
                json: true,
                body : data
            }, function(error, response, body){
                switch(body.status){
                    case 0:
                        return done(body.message_content);
                    case 1:
                        return done(null, false, req.flash(body.message_title,body.message_content));
                    case 2:
                        return done(null, body.message_content);
                }
            });
        })
    );

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'
    
        passport.use(
        'local-login',
        new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) { // callback with email and password from our form
            var data = JSON.parse('{ "username": "'+username+'", "password": "'+password+'"}');
            request({
                url : "http://localhost:8888/api/login",
                method : "POST",
                json: true,
                body : data
            }, function(error, response, body){
                switch(body.status){
                    case 0:
                        return done(body.message_content);
                    case 1:
                        return done(null, false, req.flash(body.message_title,body.message_content));
                    case 2:
                        return done(null, body.message_content);
                }
            });
        })
    );
};
