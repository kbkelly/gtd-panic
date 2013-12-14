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
		[
			{
				title: 'FOOBAR',
				start: '2013-12-24',
				end: '2013-12-25'
			}
		]
	];
});