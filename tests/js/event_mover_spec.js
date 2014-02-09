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

      expect(events[1].title).toEqual('second event');
      expect(events[1].start.getHours()).toEqual(13);
      expect(events[1].start.getMinutes()).toEqual(30);
      expect(events[1].end.getHours()).toEqual(14);
      expect(events[1].end.getMinutes()).toEqual(30);

      expect(events[2].title).toEqual('third event');
      expect(events[2].start.getHours()).toEqual(15);
      expect(events[2].start.getMinutes()).toEqual(0);
      expect(events[2].end.getHours()).toEqual(15);
      expect(events[2].end.getMinutes()).toEqual(30);
    });
  });
});