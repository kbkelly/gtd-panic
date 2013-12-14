var gtdPanic = angular.module('GtdPanic', ['ui.calendar']);

gtdPanic.controller('ScheduleController', function($scope) {
	$scope.uiConfig = {
		calendar: {
			header: {
				right: 'title'
			},
			defaultView: 'agendaDay'
		}
	};

	$scope.eventSources = [
		{
			url: '/schedule'
		}
	];
});