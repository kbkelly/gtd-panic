gtdPanic.controller('ScheduleController', function($scope, $http, $date, savedSchedule, $location, $rootScope, $window) {
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
      allDaySlot: false,
      editable: true,
      defaultView: 'agendaDay',
      ignoreTimezone: false,
      minTime: moment($date).hour(),
      dayClick: function(date, allDay, jsEvent, view) {
        var newEvent = {
          title: 'New Event',
          start: moment(date).unix(),
          duration: 1800, // 30 minutes
          end: moment(date).add('minutes', 30).unix()
        };
        $scope.$apply(function() {
          $scope.events.push(newEvent);
        });
      },
      eventDrop: function(event, dayDelta, minuteDelta) {
        function sortEvents() {
          $scope.events.sort(function sortByStartTime(a, b) {
            if (a.start < b.start) {
              return -1;
            } else if (a.start > b.start) {
              return 1;
            } else {
              return 0;
            }
          });
        }

        function moveEvent(event) {
          // When moving an event,
          //    if +delta (event moved forward)
          //      move all events between original and new index backwards by event's duration
          //    if -delta
          //      move all events between original and new index forwards by event's duration
          sortEvents();
          var secondDelta = minuteDelta * 60;
          var newStartTime = moment(event.start);
          // If the event moved forward, its old start time is in the past
          // else if it moved backwards, its old start time was in the future
          var oldStartTime = moment(newStartTime.toDate());
          var eventMovedForward = minuteDelta > 0;
          if (eventMovedForward) {
            oldStartTime.subtract('seconds', Math.abs(secondDelta));
          } else {
            oldStartTime.add('seconds', Math.abs(secondDelta));
          }
          var originalEventRange = moment.twix(event.start, event.end);
          function findOverlappingEvents(event) {
            var overlapping = [];
            var eventRange = moment.twix(event.start, event.end);
            angular.forEach($scope.events, function(otherEvent) {
              if (otherEvent === event) {
                return;
              }
              var otherRange = moment.twix(otherEvent.start, otherEvent.end);
              if (otherRange.overlaps(eventRange)) {
                overlapping.push(otherEvent);
              }
            });
            return overlapping;
          }

          function moveOverlappingEvents(anchoredEvent) {
            var overlapping = findOverlappingEvents(event);
            if (overlapping.length) {
              angular.forEach(overlapping, function(overlappingEvent) {
                moveEventUntilNotOverlapping(overlappingEvent, event);
              });
            }
          }

          function moveEventUntilNotOverlapping(eventToMove, overlappedEvent) {
            var amountToMove = overlappedEvent.duration;
            eventToMove.start = moment(eventToMove.start).add('seconds', amountToMove).toDate();
            eventToMove.end = moment(eventToMove.end).add('seconds', amountToMove).toDate();
          }

          moveOverlappingEvents(event);

        }
        $scope.$apply(function() {
          moveEvent(event);
          sortEvents();
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
          }
        }
      }
    }
  };

  $scope.eventSources = [];
  $scope.events = [];
  $scope.eventSources.push($scope.events);

  if (savedSchedule) {
    $scope.events.push.apply($scope.events, savedSchedule.events);
  }

  $rootScope.$on('uploadedEvents', function(name, uploadedEvents) {
    if (!uploadedEvents) {
      return;
    }
    if ($scope.uiConfig.randomize) {
      uploadedEvents = shuffle(uploadedEvents);
    }

    var startTime = moment($date);
    function snapToGrid(aMoment) {
      if (aMoment.minutes() > 45) {
        aMoment.add(1, 'hours');
        aMoment.minutes(0);
      } else if (aMoment.minutes() > 15 && aMoment.minutes() < 45) {
        aMoment.minutes(30);
      } else {
        aMoment.minutes(0);
      }
    }
    snapToGrid(startTime);

    function setupEventDuration(event) {
      // Duration is in seconds for some reason
      if (!event.duration) {
        event.duration = $scope.uiConfig.defaultDuration * 60;
      }
      startTime = getNextAvailableStartTime(startTime, event.duration);
      event.start = startTime.clone().toDate();
      startTime = startTime.add('seconds', event.duration);
      event.end = startTime.clone().toDate();
    }

    function eventRange(startMoment, durationSeconds) {
      var duration = moment.duration(durationSeconds, 'seconds');
      return duration.afterMoment(startMoment);
    }

    function getNextAvailableStartTime(startMoment, durationSeconds) {
      var incomingEventRange = eventRange(startMoment, durationSeconds);
      var idx = 0;

      while (idx < $scope.events.length - 1) {
        var existingEvent = $scope.events[idx];
        var existingEventRange = eventRange(existingEvent.start, existingEvent.duration);
        // If incoming event overlaps, bump startMoment to the
        // existing event's end time
        // console.log(existingEventRange.simpleFormat(), incomingEventRange.simpleFormat(), existingEventRange.overlaps(incomingEventRange));
        if (incomingEventRange.overlaps(existingEventRange)) {
          startMoment = moment(existingEvent.end);
          incomingEventRange = eventRange(startMoment, durationSeconds);
        }
        idx++;
      }
      return startMoment;
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
    angular.forEach(uploadedEvents, setupEvent);
  });

  $scope.remove = function($index) {
    $scope.events.splice($index, 1);
  };

  $scope.save = function() {
    function eventsPostData(events) {
      return _(events).map(function(event) {
        return {
          title: event.title,
          start: event.start,
          end: event.end,
          _id: event._id,
        };
      });
    }

    function redirect(schedule) {
      savedSchedule = schedule;
      $location.path('/schedule/' + schedule._id);
      $location.replace();
    }

    var postData;
    if (savedSchedule) {
      postData = {
        _id: savedSchedule._id,
        events: eventsPostData($scope.events)
      };
      $http.put('/schedules/' + savedSchedule._id, postData);
    } else {
      postData = {
        events: eventsPostData($scope.events)
      };
      $http.post('/schedules', postData).success(redirect);
    }
  };

  $scope.clear = function() {
    if (!$window.confirm('Are you sure you want to clear your schedule? This cannot be undone.')) {
      return;
    }

    function clearEvents() {
      $scope.events.length = 0;
    }

    if (savedSchedule) {
      $http.delete('/schedules/' + savedSchedule._id).success(function() {
        clearEvents();
        $location.path('/');
      });
    } else {
      clearEvents();
    }
  };
});