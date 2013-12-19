gtdPanic.controller('ScheduleController', function($scope) {
	function shuffle(array) {
	    var counter = array.length, temp, index;

	    // While there are elements in the array
	    while (counter--) {
	        // Pick a random index
	        index = (Math.random() * counter) | 0;

	        // And swap the last element with it
	        temp = array[counter];
	        array[counter] = array[index];
	        array[index] = temp;
	    }

	    return array;
	}

	$scope.uiConfig = {
		defaultDuration: 30,
		cutoffTime: 23,
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
		if ($scope.uiConfig.randomize) {
			allEvents = shuffle(allEvents);
		}
		var endTime = moment({hour: $scope.uiConfig.cutoffTime});
		function setupEvent(event) {
			if (startTime.isAfter(endTime)) {
				return;
			}
			event.allDay = false;
			event.editable = true;
			event.start = startTime.unix();
			if (event.duration > 0) {
				startTime = startTime.add('seconds', event.duration);
			} else {
				startTime = startTime.add('minutes', $scope.uiConfig.defaultDuration);				
			}
			event.end = startTime.unix();
			// console.log(event);
			$scope.events.push(event);
		}
		angular.forEach(allEvents, setupEvent);
	});

	$scope.remove = function($index) {
		$scope.events.splice($index, 1);
	}
});