if (typeof define !== 'function') { var define = require('amdefine')(module); }

/**
 * Server bootstrap
 * 
 * @author Joe Cavanagh
 */
define([
    'require',
    'underscore',
    'common/Config',
    'events',
    'express',
    'http',
    'passport',
    'path',
    'underscore.string'
], function(
    require,
    _,
    Config,
    events,
    express,
    http,
    passport,
    path,
    underscoreStr
) {
    'use strict';

    //LEFT SIDE!  MANY EXCEPTIONS!  HANDLE IT!
    process.on('uncaughtException', function(err) {
        console.error('UNCAUGHT EXCEPTION: ', err, err.stack);
    });

    //Lyrical!
    var app = express();

    //Underscore extensions
    _.str = underscoreStr;
    _.str.include('Underscore.string', 'string');
    _.emptyFn = function() {};

    //Wait for config
    Config.onConfigLoaded(function() {
        //Set development error handler
        if (Config.get('lyrical.developmentMode')) {
            app.use(express.errorHandler());
        }

        //Load models
        //ORM needs to be loaded here, since it needs Config
        require(['orm/orm', 'common/ModelLoader'], function(orm, ModelLoader) {
            ModelLoader.loadAll(function() {
                var forceSync = Config.get('lyrical.forceSync') || false;
                orm.sync({ force: forceSync, logging: true }).success(function() {
                    //Set server port
                    app.set('port', Config.get('lyrical.server.port') || 3002);

                    //Set app middleware
                    app.set('views', __dirname + '/views')
                        .set('view engine', 'jade')
                        .use(express.favicon())
                        .use(express.logger('dev'))
                        .use(express.bodyParser())
                        //FIXME: This is a nasty hack to deal with Sequelize and Postgres empty arrays
                        .use(function(req, res, next) {
                            //Strip empty arrays and replace with null
                            for(var key in req.body) {
                                var val = req.body[key];
                                if(val && _.isArray(val) && !val.length) {
                                    req.body[key] = null;
                                }
                            }

                            next();
                        })
                        .use(express.methodOverride())
                        .use(express.static(path.join(__dirname, 'public')))
                        .use(express.cookieParser(Config.get('lyrical.server.cookieSecret')))
                        .use(express.session({
                            secret: Config.get('lyrical.server.sessionSecret')
                        }))
                        .use(passport.initialize())
                        .use(passport.session())
                        .use(app.router);

                    require([
                        'models/User'
                    ], function(User) {
                        //Configure authentation strategies


                        //Configure authentication user storage
                        passport.serializeUser(function(user, done) {
                            done(null, user.id);
                        });

                        passport.deserializeUser(function(id, done) {
                            User.model.find(id, function(user){
                                done(null, user);
                            });
                        });

                        //Set routes
                        //Controllers require models, so need to be loaded here
                        //after ORM initialization
                        require([
                            'controllers/index',
                            'controllers/Auth',
                            'controllers/Lyric',
                            'controllers/Meaning',
                            'controllers/Playlist',
                            'controllers/PlaylistLyric'
                        ], function(index, Auth, Lyric, Meaning, Playlist, PlaylistLyric) {
                            //Authenticated routes helper
                            function authenticated(req, res, next) {
                                if (req.isAuthenticated()) {
                                    return next();
                                } else {
                                    res.redirect('/login');
                                }
                            }

                            //Index
                            app.get('/', index.index);

                            //Auth
                            app.get('/login', Auth.login);
                            app.get('/logout', Auth.logout);

                            app.get('/auth/google', passport.authenticate('google'));
                            app.get('/auth/google/callback', 
                                passport.authenticate('google', { successRedirect: '/', failureRedirect: '/' })
                            );

                            // app.get('/auth/facebook', passport.authenticate('facebook'));
                            // app.get('/auth/facebook/callback', 
                            //     passport.authenticate('facebook', { successRedirect: '/', failureRedirect: '/' })
                            // );

                            // app.get('/auth/twitter', passport.authenticate('twitter'));
                            // app.get('/auth/twitter/callback', 
                            //     passport.authenticate('twitter', { successRedirect: '/', failureRedirect: '/' })
                            // );

                            // app.get('/auth/soundcloud', passport.authenticate('soundcloud'));
                            // app.get('/auth/soundcloud/callback', 
                            //     passport.authenticate('soundcloud', { successRedirect: '/', failureRedirect: '/' })
                            // );

                            // app.get('/auth/youtube', passport.authenticate('youtube'));
                            // app.get('/auth/youtube/callback', 
                            //     passport.authenticate('youtube', { successRedirect: '/', failureRedirect: '/' })
                            // );

                            //Lyric
                            app.get('/api/lyrics', authenticated, Lyric.index);
                            app.get('/api/lyrics/:id', authenticated, Lyric.get);
                            app.post('/api/lyrics', authenticated, Lyric.post);
                            app.put('/api/lyrics/:id', authenticated, Lyric.put);
                            app.delete('/api/lyrics/:id', authenticated, Lyric.delete);

                            //Meaning
                            app.get('/api/meanings', authenticated, Meaning.index);
                            app.get('/api/meanings/:id', authenticated, Meaning.get);
                            app.post('/api/meanings', authenticated, Meaning.post);
                            app.put('/api/meanings/:id', authenticated, Meaning.put);
                            app.delete('/api/meanings/:id', authenticated, Meaning.delete);

                            //Playlist
                            app.get('/api/playlists', authenticated, Playlist.index);
                            app.get('/api/playlists/:id', authenticated, Playlist.get);
                            app.post('/api/playlists', authenticated, Playlist.post);
                            app.put('/api/playlists/:id', authenticated, Playlist.put);
                            app.delete('/api/playlists/:id', authenticated, Playlist.delete);

                            //PlaylistLyric
                            app.post('/api/playlists/:playlistId/lyric/:lyricId', authenticated, PlaylistLyric.post);
                            app.delete('/api/playlists/:playlistId/lyric/:lyricId', authenticated, PlaylistLyric.delete);

                            //Start server
                            http.createServer(app).listen(app.get('port'), function(){
                                console.log('Express server listening on port ' + app.get('port'));
                            });
                        });
                    });
                }).error(function(error) {
                    console.error('Failed to sync database:');
                    console.error(error);
                });
            });
        });
    }, this);

    return app;
});
