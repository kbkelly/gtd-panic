var gtdPanic = angular.module('GtdPanic', ['ui.calendar', 'angularFileUpload'], function($interpolateProvider) {
    $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');
});