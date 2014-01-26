var gtdPanic = angular.module('GtdPanic', [
    'ui.calendar',
    'ui.router',
    'angularFileUpload'
    ], 
    function($interpolateProvider) {
    $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');
});

gtdPanic.service('$date', function() {
    return new Date();
});

gtdPanic.config(function($locationProvider) {
    $locationProvider.html5Mode(true);
});

gtdPanic.config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');

    $stateProvider
        .state('home', {
            url: '/',
            templateUrl: 'home.html',
            controller: 'ScheduleController',
            resolve: {
                savedEvents: function($http) {
                    return $http.get('/schedules/today').then(function(response) {
                        return response.data;
                    });
                }
            }
        });
});