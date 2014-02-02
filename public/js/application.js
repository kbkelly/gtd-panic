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
    $locationProvider.hashPrefix('!');
});

gtdPanic.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('home', {
            url: '/',
            templateUrl: 'home.html',
            controller: 'ScheduleController',
            resolve: {
                savedSchedule: function() {
                    return null;
                }
            }
        })
        .state('savedSchedule', {
            url: '/schedule/{id}',
            templateUrl: 'home.html',
            controller: 'ScheduleController',
            resolve: {
                savedSchedule: function($stateParams, $http) {
                    return $http.get('/schedules/' + $stateParams.id)
                        .then(function(response) {
                            return response.data;
                        });
                }
            }
        })
        .state('error404', {
            url: '/errors/404',
            templateUrl: '404.html'
        });

    $urlRouterProvider.otherwise('/errors/404');
});