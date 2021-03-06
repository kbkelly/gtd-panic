gtdPanic.controller('ScheduleController', function($scope, $http, $date, savedSchedule, $location, $rootScope, $window, eventMover) {
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

  function focusEventTitleInput(event) {
    $scope.$apply(function() {
      event.focused = true;
    });
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
      eventRender: function(event, element) {
        element.bind('dblclick', function() {
          focusEventTitleInput(event);
        });
      },
      dayClick: function(date) {
        var start = new Date(date);
        var newEvent = {
          title: 'New Event',
          start: start,
          end: moment(start).add('minutes', $scope.uiConfig.defaultDuration).toDate()
        };
        $scope.$apply(function() {
          $scope.events.push(newEvent);
        });
        focusEventTitleInput(newEvent);
      },
      eventDrop: function(event) {
        $scope.$apply(function() {
          eventMover.displaceEvents($scope.events, event);
        });
      },
      eventResize: function(event, dayDelta, minuteDelta) {
        $scope.$apply(function() {
          eventMover.displaceEvents($scope.events, event);
        });
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
      aMoment.seconds(0);
    }
    snapToGrid(startTime);

    function setupEvent(event) {
      // Duration is in seconds for some reason
      // It is also transient and should not be persisted
      var durationInSeconds;
      if (event.duration) {
        durationInSeconds = event.duration;
        delete event.duration;
      } else {
        durationInSeconds = $scope.uiConfig.defaultDuration * 60;
      }
      startTime = getNextAvailableStartTime(startTime, durationInSeconds);
      event.start = startTime.clone().toDate();
      startTime.add('seconds', durationInSeconds);
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
        var existingEventRange = moment.twix(existingEvent.start, existingEvent.end);
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

    function ingestEvent(event) {
      // Skip events after the cutoff
      if (startTime.hour() >= $scope.uiConfig.cutoffTime) {
        return;
      }
      setupEvent(event);

      // console.log(event);
      $scope.events.push(event);
    }
    angular.forEach(uploadedEvents, ingestEvent);
  });

  $scope.remove = function(eventId) {
    var foundEvent = _.findWhere($scope.events, {_id: eventId});
    var index = $scope.events.indexOf(foundEvent);
    $scope.events.splice(index, 1);
  };

  $scope.save = function() {
    function eventsPostData(events) {
      return events.map(function(event) {
        return {
          title: event.title,
          start: event.start,
          end: event.end
        };
      });
    }

    function redirect(schedule) {
      savedSchedule = schedule;
      $location.path('/schedule/' + schedule._id);
      $location.replace();
    }

    var postData, promise;
    $scope.saving = true;
    if (savedSchedule) {
      postData = {
        _id: savedSchedule._id,
        events: eventsPostData($scope.events)
      };
      promise = $http.put('/schedules/' + savedSchedule._id, postData);
    } else {
      postData = {
        events: eventsPostData($scope.events)
      };
      promise = $http.post('/schedules', postData).success(redirect);
    }
    promise.finally(function() {
      $scope.saving = false;
    });
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