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
			defaultView: 'agendaDay',
			firstHour: moment().hour(),
			dayClick: function(date, allDay, jsEvent, view) {
				var newEvent = {
					title: 'New Event',
					start: moment(date).unix(),
					end: moment(date).add('minutes', 30).unix(),
					allDay: false,
					editable: true
				};
				$scope.$apply(function() {
					$scope.events.push(newEvent);
				});
			}
		}
	};

	$scope.eventSources = [];
	$scope.events = [];
	$scope.eventSources.push($scope.events);

	$scope.$watch('allEvents', function(allEvents) {
		if (!allEvents) {
			return;
		}
		var startTime = moment();
		angular.forEach(allEvents, function(event) {
			event.allDay = false;
			event.editable = true;
			event.start = startTime.unix();
			if (event.duration > 0) {
				startTime = startTime.add('seconds', event.duration);
			} else {
				startTime = startTime.add('minutes', 30);				
			}
			event.end = startTime.unix();
			// console.log(event);
			$scope.events.push(event);
		});
	});

	$scope.remove = function($index) {
		$scope.events.splice($index, 1);
	}
});