describe('eventMover service', function() {
  beforeEach(module('GtdPanic'));

  var eventMover;
  beforeEach(inject(function(_eventMover_) {
    eventMover = _eventMover_;
  }));

  describe('#displaceEvents', function() {
    it('can move overlapping events until they are not overlapping', function() {
      var events = [
        {
          title: 'first event',
          start: new Date(2020, 3, 3, 12, 0, 0),
          end: new Date(2020, 3, 3, 13, 30, 0),
          duration: 5400
        },
        {
          title: 'second event',
          start: new Date(2020, 3, 3, 12, 30, 0),
          end: new Date(2020, 3, 3, 13, 30, 0),
          duration: 3600
        },
        {
          title: 'third event',
          start: new Date(2020, 3, 3, 15, 0, 0),
          end: new Date(2020, 3, 3, 15, 30, 0),
          duration: 1800
        }
      ];
      var anchorEvent = events[0];
      eventMover.displaceEvents(events, anchorEvent);
      expectEventPlacement(events, 0, 'first event', 12, 0, 13, 30);
      expectEventPlacement(events, 1, 'second event', 13, 30, 14, 30);
      expectEventPlacement(events, 2, 'third event', 15, 0, 15, 30)
    });
  });
});