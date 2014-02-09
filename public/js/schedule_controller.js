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
      dayClick: function(date) {
        var start = new Date(date);
        var newEvent = {
          title: 'New Event',
          start: start,
          end: moment(start).add('minutes', 30).toDate()
        };
        $scope.$apply(function() {
          $scope.events.push(newEvent);
        });
      },
      eventDrop: function(event) {
        $scope.$apply(function() {
          eventMover.displaceEvents($scope.events, event);
        });
      },
      eventResize: function(event, dayDelta, minuteDelta) {
        event.duration += minuteDelta * 60;
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
          duration: event.duration
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