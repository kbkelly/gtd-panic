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
			header: {
				right: 'title'
			},
			defaultView: 'agendaDay'
		}
	};

	$scope.eventSources = [];

	$scope.$watch('allEvents', function(allEvents) {
		if (!allEvents) {
			return;
		}
		var eventConfig = {
			events: allEvents
		};
		$scope.eventSources.push(eventConfig);
	});
});