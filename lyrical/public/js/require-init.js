//Setup Require
require.config({
    baseUrl: '/js',
    paths: {
        angular: 'lib/angular',
        angularRoute: 'lib/angular-route.min',
        angularResource: 'lib/angular-resource.min',
        angularSanitize: 'lib/angular-sanitize.min',
        bootstrapAngularUi: 'lib/ui-bootstrap.min'
    },
    shim: {
        angular: { exports: 'angular' },
        angularRoute: [ 'angular' ],
        bootstrapAngularUi: { deps: [ 'angular' ]}
    },
    priority: [
        'angular'
    ]
});
