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
				start: '2013-12-13 9:00',
				end: '2013-12-13 10:00',
				allDay: false
			}
		]
	];
});