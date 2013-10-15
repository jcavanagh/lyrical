if (typeof define !== 'function') { var define = require('amdefine')(module); }

/**
 * Server bootstrap
 * 
 * @author Joe Cavanagh
 */
define([
    'underscore'
    ,'common/Config'
    ,'events'
    ,'express'
    ,'http'
    ,'routes/index'
    ,'path'
    ,'underscore.string'
], function(
    _
    ,Config
    ,events
    ,express
    ,http
    ,index
    ,path
    ,underscoreStr
) {
    'use strict';

    var app = express();

    //Set app parameters
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));

    // development only
    if ('development' == app.get('env')) {
        app.use(express.errorHandler());
    }

    //Underscore extensions
    _.str = underscoreStr;
    _.str.include('Underscore.string', 'string');
    _.emptyFn = function() {};

    //Set routes
    app.get('/', index.index);
    app.get('/l', index.lyric);
    app.get('/s', index.set);

    //Wait for config
    Config.onConfigLoaded(function() {
        app.set('port', Config.get('server.port') || 3002);

        //Start server
        http.createServer(app).listen(app.get('port'), function(){
            console.log('Express server listening on port ' + app.get('port'));
        });
    }, this);

    return app;
});
