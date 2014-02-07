if (typeof define !== 'function') { var define = require('amdefine')(module); }

/**
 * Auth routes
 * 
 * @class
 * @author Joe Cavanagh
 */
define([
    'passport',
    'passport-google',
    'models/User'
], function(passport, google, User) {
    'use strict';

    //Initialize authentication strategies
    passport.use(new google.Strategy({
            returnURL: 'http://localhost:3002/auth/google/callback',
            realm: 'http://localhost:3002/'
        },

        function(identifier, profile, done) {
            profile = profile || {};

            //Pull profile data
            var id = profile.id,
                displayName = profile.displayName,
                firstName = profile.name ? profile.name.givenName : '',
                lastName = profile.name ? profile.name.familyName : '',
                email = profile.emails && profile.emails.length ? profile.emails[0] : '',
                photo = profile.photos && profile.photos.length ? profile.photos[0] : '';

            var profileData = {
                g_id: identifier,
                provider: 'google',
                displayName: displayName,
                firstName: firstName,
                lastName: lastName,
                email: email,
                photo: photo
            };

            //Create or find user
            User.model.findOrCreate({ g_id: identifier }, profileData).success(function(user, created) {
                if(created) {
                    return done(null, user);
                } else {
                    //Update profile
                    user.updateAttributes(profileData).success(function() {
                        return done(null, user);
                    }).failure(function(error) {
                        return done(error, null);
                    });
                }
            }).error(function(error) {
                return done(error, null);
            });
        })
    );

    passport.use(new LocalStrategy(
        function(username, password, done) {
            //Create or find user
            User.model.find({ l_id: username }).success(function(user) {
                if(!user) {
                    return done(null, false, { message: 'Invalid username' });
                }

                if(User.model.hashPassword(password) === user.get('l_password')) {
                    return done(null, user);                    
                } else {
                    return done(null, false, { message: 'Invalid password' });
                }
            }).error(function(error) {
                done(error, null);
            });
        }
    ));

    return {
        /*
         * GET /login
         */
        login: function(req, res) {
            var username = req.params.username;

            if(username) {
                User.find({ where: { username: username } }).success(function(user) {
                    res.status(200).json(user);
                }).error(function(error) {
                    res.status(401).json({});
                });
            } else {
                res.status(400).json({});
            }
        },

        /*
         * GET /logout
         */
        logout: function(req, res) {
            req.logout();
            res.redirect('/');
        }
    };
});
