//Setup Require
require.config({
    baseUrl: '/js',
    paths: {
        angular: 'lib/angular.min',
        angularRoute: 'lib/angular-route.min',
        angularResource: 'lib/angular-resource.min',
        angularSanitize: 'lib/angular-sanitize.min',
        bootstrapAngularUi: 'lib/ui-bootstrap.min',
        jquery: 'lib/jquery-1.10.2.min'
    },
    shim: {
        angular: { exports: 'angular', deps: [ 'jquery' ] },
        angularRoute: [ 'angular' ],
        bootstrapAngularUi: { deps: [ 'angular' ]}
    },
    priority: [
        'angular'
    ]
});
