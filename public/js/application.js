var gtdPanic = angular.module('GtdPanic', ['ui.calendar', 'angularFileUpload'], function($interpolateProvider) {
    $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');
});

angular.module('GtdPanic').service('$date', function() {
    return new Date();
});