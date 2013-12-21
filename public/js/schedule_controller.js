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
			allDayDefault: false,
			editable: true,
			defaultView: 'agendaDay',
			minTime: moment().hour(),
			dayClick: function(date, allDay, jsEvent, view) {
				var newEvent = {
					title: 'New Event',
					start: moment(date).unix(),
					end: moment(date).add('minutes', 30).unix()
				};
				$scope.$apply(function() {
					$scope.events.push(newEvent);
				});
			},
			// TODO: Add event for dragging
			eventResize: function(event,dayDelta,minuteDelta,revertFunc) {
				// Change the duration of this event and fix the start/end times for all events after this one
				event.duration = event.duration + minuteDelta * 60;
				// Now iterate over all events and set their dates accordingly
				var index = $scope.events.indexOf(event);
				$scope.$apply(function() {
					sortEventsAfter(index);
				});
				function sortEventsAfter(index) {
					var events = $scope.events;
					var comparator = function(eventA, eventB) {
						var startA = moment(eventA.start);
						var startB = moment(eventB.start);
						if (startA.isBefore(startB)) {
							return -1;
						} else if (startA.isAfter(startB)) {
							return 1;
						} else {
							return 0;
						}
					}
					$scope.events = events.slice(0, index).sort(comparator).concat(events.slice(index));

					// debugger;
					var startTime = moment($scope.events[index].start);
					for (var i = index; i < $scope.events.length; i++) {
						var event = $scope.events[i];
						// DUPLICATED
						event.start = startTime.unix();
						startTime = startTime.add('seconds', event.duration);
						event.end = startTime.unix();
					};
				}
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
		if ($scope.uiConfig.randomize) {
			allEvents = shuffle(allEvents);
		}

		var startTime = moment();
		var endTime = moment({hour: $scope.uiConfig.cutoffTime});

		function setupEventDuration(event) {
			// Duration is in seconds for some reason
			if (!event.duration) {
				event.duration = $scope.uiConfig.defaultDuration * 60;
			}

			event.start = startTime.unix();
			startTime = startTime.add('seconds', event.duration);
			event.end = startTime.unix();
		}
		
		function setupEvent(event) {
			// Skip events after the cutoff
			if (startTime.isAfter(endTime)) {
				return;
			}
			setupEventDuration(event);

			// console.log(event);
			$scope.events.push(event);
		}
		angular.forEach(allEvents, setupEvent);
	});

	$scope.remove = function($index) {
		$scope.events.splice($index, 1);
	}
});