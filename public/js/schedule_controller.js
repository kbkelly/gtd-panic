gtdPanic.controller('ScheduleController', function($scope, $http, $date) {
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
			minTime: moment($date).hour(),
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
			eventDrop: function(event, dayDelta, minuteDelta) {
				function moveEvent(event) {
					// When moving an event,
					//	insert the event into the right place in the list (original index & new index)
					//		if +delta (event moved forward)
					//			move all events between original and new index backwards by event's duration
					//		if -delta
					//			move all events between original and new index forwards by event's duration
					// 	all events after the event should be moved forward by the 
					function moveEventWithinList(event) {
						var index = $scope.events.indexOf(event);
						// Assume that events are sorted by start time

						// Remove the event and add it back in the right place
						$scope.events.splice(index, 1);
						
						// Find the event that is immediately following this moved event's new time
						var eventStart = moment(event.start);
						var firstAfter = _.find($scope.events, function(otherEvent) {
							var otherEventStart = moment(otherEvent.start);
							if (eventStart.isSame(otherEventStart) || otherEventStart.isAfter(eventStart)) {
								return otherEvent;
							}
						});
						var firstAfterIndex = $scope.events.indexOf(firstAfter);
						$scope.events = $scope.events.slice(0, firstAfterIndex).concat(event, $scope.events.slice(firstAfterIndex));						
					}
					moveEventWithinList(event);					
					var secondDelta = minuteDelta * 60;
					var newStartTime = moment(event.start);
					var oldStartTime = newStartTime.subtract('seconds', secondDelta);
					var newEndTime = moment(event.end);
					function moveDisplacedEvents(moveForward) {
						// Need to displace some existing events
						angular.forEach($scope.events, function(movingEvent) {
							if (movingEvent === event) {
								return;
							}
							var movingEventStart = moment(movingEvent.start);
							var movingEventEnd = moment(movingEvent.end);
							if (moveForward) {
								// Between new start time and old start time
								if ((movingEventStart.isAfter(newStartTime) ||
									 movingEventStart.isSame(newStartTime)) && 
									(movingEventEnd.isBefore(oldStartTime) || 
									 movingEventEnd.isSame(oldStartTime)))
									{
									movingEvent.start = movingEventStart + event.duration;
									movingEvent.end = movingEventEnd + event.duration;									
								}
							} else {
								if ((movingEventStart.isAfter(oldStartTime) ||
									 movingEventStart.isSame(oldStartTime)) && 
									(movingEventEnd.isBefore(newEndTime) || 
									 movingEventEnd.isSame(newEndTime))) {
									movingEvent.start = movingEventStart.subtract('seconds', event.duration).toDate();
									movingEvent.end = movingEventEnd.subtract('seconds', event.duration).toDate();
								}
							}
						});						
					}
					if (minuteDelta > 1) {
						moveDisplacedEvents(false);
					} else {
						moveDisplacedEvents(true);
					}					
				}
				$scope.$apply(function() {
					moveEvent(event);
				});
			},
			eventResize: function(event,dayDelta,minuteDelta,revertFunc) {
				// Change the duration of this event and fix the start/end times for all events after this one
				var secondsDelta = minuteDelta * 60;
				$scope.$apply(function() {
					var index = $scope.events.indexOf(event);
					moveEventsAfter(index);
				});
				function moveEventsAfter(index) {
					for (var i = index + 1; i < $scope.events.length; i++) {
						var eventToMove = $scope.events[i];
						eventToMove.start = moment(eventToMove.start).add('seconds', secondsDelta).toDate();
						eventToMove.end = moment(eventToMove.end).add('seconds', secondsDelta).toDate();
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

		var startTime = moment($date);

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
			if (startTime.hour() >= $scope.uiConfig.cutoffTime) {
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

	$scope.save = function() {
		$http.post('/schedules', $scope.events);
	};

	$scope.clear = function() {
		$scope.events.length = 0;
		$scope.allEvents.length = 0;
	}
});