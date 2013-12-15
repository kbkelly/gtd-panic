var gtdPanic = angular.module('GtdPanic', ['ui.calendar', 'angularFileUpload']);

gtdPanic.controller('UploadController', function($scope, $upload, $rootScope) {
	$scope.onSelectCsv = function($files) {
		var $file = $files[0];
      	$scope.upload = $upload.upload({
        	url: '/omnifocus_upload',
        	method: 'POST',
        	file: $file,
      })
      	.success(function(events, status, headers, config) {
        $rootScope.allEvents = events;
      })
      .error(function() {
      	console.error('File failed to upload');
      });
	}
});

gtdPanic.controller('ScheduleController', function($scope) {
	$scope.uiConfig = {
		calendar: {
			defaultView: 'agendaDay'
		}
	};

	$scope.eventSources = [];
	$scope.events = [];

	$scope.$watch('allEvents', function(allEvents) {
		if (!allEvents) {
			return;
		}
		angular.forEach(allEvents, function(event) {
			event.allDay = false;
			event.editable = true;
			$scope.events.push(event);
		});
		// var eventConfig = {
		// 	events: allEvents
		// };
		$scope.eventSources.push($scope.events);
	});

	$scope.remove = function($index) {
		$scope.events.splice($index, 1);
	}
});