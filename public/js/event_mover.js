gtdPanic.service('eventMover', function() {
  this.displaceEvents = function(movableEvents, anchorEvent, minuteDelta) {
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
      // console.log('range length', startRange.length('seconds'));
      // console.log('anchored event', anchoredEvent);
      var amountToMove = startRange.length('seconds') + anchoredEvent.duration;
      // console.log('moving', eventToMove, 'by', amountToMove);
      eventToMove.start = moment(eventToMove.start).add('seconds', amountToMove).toDate();
      eventToMove.end = moment(eventToMove.end).add('seconds', amountToMove).toDate();
    }

    function moveOverlappingEvents(anchoredEvent) {
      var overlapping = findOverlappingEvents(anchoredEvent);
      // console.log(overlapping);
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

    // When moving an event,
    //    if +delta (event moved forward)
    //      move all events between original and new index backwards by event's duration
    //    if -delta
    //      move all events between original and new index forwards by event's duration
    sortEvents();
    var secondDelta = minuteDelta * 60;
    var newStartTime = moment(anchorEvent.start);
    // If the event moved forward, its old start time is in the past
    // else if it moved backwards, its old start time was in the future
    var oldStartTime = moment(newStartTime.toDate());
    var eventMovedForward = minuteDelta > 0;
    if (eventMovedForward) {
      oldStartTime.subtract('seconds', Math.abs(secondDelta));
    } else {
      oldStartTime.add('seconds', Math.abs(secondDelta));
    }
    var originalEventRange = moment.twix(anchorEvent.start, anchorEvent.end);
    moveOverlappingEvents(anchorEvent);
    sortEvents();
  }
});