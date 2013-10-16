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
    'path',
    'underscore.string'
], function(
    require,
    _,
    Config,
    events,
    express,
    http,
    path,
    underscoreStr
) {
    'use strict';

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
                orm.sync({
                    //FIXME: Remove this later, use migrations
                    force: true
                }).success(function() {
                    //Set server port
                    app.set('port', Config.get('lyrical.server.port') || 3002);

                    //Set app middleware
                    app.set('views', __dirname + '/views');
                    app.set('view engine', 'jade');
                    app.use(express.favicon());
                    app.use(express.logger('dev'));
                    app.use(express.bodyParser());
                    app.use(express.methodOverride());
                    app.use(app.router);
                    app.use(express.static(path.join(__dirname, 'public')));

                    //Set routes
                    //Controllers require models, so need to be loaded here
                    //after ORM initialization
                    require([
                        'controllers/index',
                        'controllers/Lyric',
                        'controllers/Meaning',
                        'controllers/Playlist'
                    ], function(index, Lyric, Meaning, Playlist) {
                        //Index
                        app.get('/', index.index);

                        //Lyric
                        app.get('/api/lyric', Lyric.index);
                        app.get('/api/lyric/:id', Lyric.get);
                        app.post('/api/lyric', Lyric.post);
                        app.put('/api/lyric/:id', Lyric.put);
                        app.delete('/api/lyric/:id', Lyric.delete);

                        //Meaning
                        app.get('/api/meaning', Meaning.index);
                        app.get('/api/meaning/:id', Meaning.get);
                        app.post('/api/meaning', Meaning.post);
                        app.put('/api/meaning/:id', Meaning.put);
                        app.delete('/api/meaning/:id', Meaning.delete);

                        //Playlist
                        app.get('/api/playlist', Playlist.index);
                        app.get('/api/playlist/:id', Playlist.get);
                        app.post('/api/playlist', Playlist.post);
                        app.put('/api/playlist/:id', Playlist.put);
                        app.delete('/api/playlist/:id', Playlist.delete);

                        //Start server
                        http.createServer(app).listen(app.get('port'), function(){
                            console.log('Express server listening on port ' + app.get('port'));
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
