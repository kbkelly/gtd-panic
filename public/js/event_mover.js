gtdPanic.service('eventMover', function() {
  this.displaceEvents = function(movableEvents, anchorEvent) {
    function sortEvents() {
      movableEvents.sort(function sortByStartTime(a, b) {
        if (a.start < b.start) {
          return -1;
        } else if (a.start > b.start) {
          return 1;
        } else {
          return 0;
        }
      });
    }

    function moveEventUntilNotOverlapping(eventToMove, anchoredEvent) {
      // A = event to move
      // B = anchored event
      // dist = A.start - B.start + B.duration
      var startRange = moment.twix(eventToMove.start, anchoredEvent.start);
      var amountToMove = startRange.length('seconds') + anchoredEvent.duration;
      eventToMove.start = moment(eventToMove.start).add('seconds', amountToMove).toDate();
      eventToMove.end = moment(eventToMove.end).add('seconds', amountToMove).toDate();
    }

    function moveOverlappingEvents(anchoredEvent) {
      var overlapping = findOverlappingEvents(anchoredEvent);
      if (overlapping.length) {
        angular.forEach(overlapping, function(overlappingEvent) {
          moveEventUntilNotOverlapping(overlappingEvent, anchoredEvent);
        });
        moveOverlappingEvents(overlapping[0]);
      }
    }

    function findOverlappingEvents(event) {
      var overlapping = [];
      var eventRange = moment.twix(event.start, event.end);
      angular.forEach(movableEvents, function(otherEvent) {
        if (otherEvent === event) {
          return;
        }
        var otherRange = moment.twix(otherEvent.start, otherEvent.end);
        // console.log('checking if', otherEvent, 'overlaps', event, '=', otherRange.overlaps(eventRange));
        if (otherRange.overlaps(eventRange)) {
          overlapping.push(otherEvent);
        }
      });
      return overlapping;
    }

    sortEvents();
    moveOverlappingEvents(anchorEvent);
    sortEvents();
  };
});