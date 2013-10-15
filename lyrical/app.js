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
    'controllers/index',
    'common/ModelLoader',
    'path',
    'underscore.string'
], function(
    require,
    _,
    Config,
    events,
    express,
    http,
    index,
    ModelLoader,
    path,
    underscoreStr
) {
    'use strict';

    var app = express();

    //Set app middleware
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));

    //Underscore extensions
    _.str = underscoreStr;
    _.str.include('Underscore.string', 'string');
    _.emptyFn = function() {};

    //Set routes
    app.get('/', index.index);

    //Wait for config
    Config.onConfigLoaded(function() {
        //Set development error handler
        if (Config.get('lyrical.developmentMode')) {
            app.use(express.errorHandler());
        }

        //Set server port
        app.set('port', Config.get('lyrical.server.port') || 3002);

        //Load models
        require(['orm/orm'], function(orm) {
            ModelLoader.loadAll(function() {
                orm.sync({
                    //FIXME: Remove this later
                    force: true
                }).success(function() {
                    //Start server
                    http.createServer(app).listen(app.get('port'), function(){
                        console.log('Express server listening on port ' + app.get('port'));
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
