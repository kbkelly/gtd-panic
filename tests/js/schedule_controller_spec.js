describe('ScheduleController', function() {
	beforeEach(module('GtdPanic'));

	var scope, controller, currentDate;
	beforeEach(inject(function($rootScope, $controller, $httpBackend) {
		currentDate = new Date(2020, 3, 3, 9, 0, 0); // 9am
		scope = $rootScope.$new();

		controller = $controller('ScheduleController', {
			$scope: scope,
			$date: currentDate,
			savedSchedule: null
		});
	}));

	it('injects previously saved events into the calendar', inject(function($controller) {
    var schedule = {
      events: [
        {title: 'first saved event'}
      ]
    };
		$controller('ScheduleController', {$scope: scope, savedSchedule: schedule});
		expect(scope.events.length).toEqual(1);
	}));

	it('sets up the default calendar config', function() {
		expect(scope.uiConfig.defaultDuration).toEqual(30);
		expect(scope.uiConfig.cutoffTime).toEqual(23); // 11pm
	});

	describe('incoming events', function() {
		it('properly configures timing of incoming events', function() {
			var events = [
				{title: 'first event'},
				{title: 'second event'}
			];
			scope.allEvents = events;
			scope.$apply();
			expect(scope.events.length).toEqual(2);
			expect(events[0].start).toBeDefined();
			expect(events[0].end).toBeDefined();
			// Default duration of 30m
			expect(events[0].start.getHours()).toEqual(9);
			expect(events[0].start.getMinutes()).toEqual(0);
			expect(events[0].end.getHours()).toEqual(9);
			expect(events[0].end.getMinutes()).toEqual(30);
			// Proper chronological ordering
			expect(events[1].start.getHours()).toEqual(9);
			expect(events[1].start.getMinutes()).toEqual(30);
			expect(events[1].end.getHours()).toEqual(10);
			expect(events[1].end.getMinutes()).toEqual(0);
			expect(scope.eventSources[0]).toEqual(events);
		});

    it('does not overlap incoming events with existing events', function() {
      var incomingEvents = [
        {title: 'first event'},
        {title: 'second event'}
      ];
      var existingEvent = {
        title: 'existing event'
      };
      // the main beforeEach sets the time to 9am
      // the existing event is 9:30-10am
      // incoming events should show at 9am and 10am
      var existingEvent = {
        title: 'existing event',
        start: new Date(2020, 3, 3, 9, 30, 0),
        end: new Date(2020, 3, 3, 10, 0, 0),
        duration: 1800
      }
      scope.events.push(existingEvent);
      scope.allEvents = incomingEvents;
      scope.$apply();
      expect(incomingEvents[0].start.getHours()).toEqual(9);
      expect(incomingEvents[0].start.getMinutes()).toEqual(0);
      expect(incomingEvents[0].end.getHours()).toEqual(9);
      expect(incomingEvents[0].end.getMinutes()).toEqual(30);
      expect(incomingEvents[1].start.getHours()).toEqual(10);
      expect(incomingEvents[1].start.getMinutes()).toEqual(0);
      expect(incomingEvents[1].end.getHours()).toEqual(10);
      expect(incomingEvents[1].end.getMinutes()).toEqual(30);
    });

		it('allows events to have a predefined duration', function() {
			var events = [
				{title: 'first event', duration: 3600},
				{title: 'second event'}
			];
			// Inject the events
			scope.allEvents = events;
			scope.$apply();

			expect(events[0].start.getHours()).toEqual(9);
			expect(events[0].start.getMinutes()).toEqual(0);
			expect(events[0].end.getHours()).toEqual(10);
			expect(events[0].end.getMinutes()).toEqual(00);
		});
	});

	it('can remove events', function() {
		scope.events = [
			{title: 'removed event'},
			{title: 'remaining event'}
		];
		scope.remove(0);
		expect(scope.events.length).toEqual(1);
		expect(scope.events[0].title).toEqual('remaining event');
	});

	describe('saving', function() {
		it('can save events', inject(function($httpBackend) {
			scope.events = [
				{title: 'saved event'}
			];
			var expectedPostData = {
				events: scope.events
			};
			$httpBackend.expectPOST('/schedules', expectedPostData).respond({
				_id: 'foo'
			});
			scope.save();
			$httpBackend.flush();
			$httpBackend.verifyNoOutstandingExpectation();
		}));

		it('updates existing schedules', inject(function($controller, $httpBackend) {
			scope.events = [
				{_id: 'eventid', title: 'saved event'}
			];
      var savedSchedule = {
          _id: 'scheduleid',
          events: []
      };
      $controller('ScheduleController', {
        $scope: scope, 
        savedSchedule: savedSchedule
      });
			savedSchedule.events.push.apply(savedSchedule.events, scope.events);
			$httpBackend.expectPUT('/schedules/scheduleid', scope.schedule).respond({
				_id: 'scheduleid',
				events: [
					{_id: 'eventid', title: 'saved event'}
				]
			});
			scope.save();
			$httpBackend.flush();
		}));

		it('saving only serializes relevant object properties', inject(function($httpBackend) {
			// Don't want to send sequelize objects back to the server
			scope.events = [ {
				title: 'send me back',
				start: 'foo',
				end: 'bar',
				_id: 123,
				source: {another: 'object'},
				__uiCalId: 'whatever'
			}];
			var expectedPostData = {
				events: [
					{
						title: 'send me back',
						start: 'foo',
						end: 'bar',
						_id: 123,
					}
				]
			};
			$httpBackend.expectPOST('/schedules', expectedPostData).respond({
				_id: 'foo',
				events: [
					{
						title: 'send me back',
						start: 'foo',
						end: 'bar',
						_id: 123,
					}
				]
			});
			scope.save();
			$httpBackend.flush();
		}));
	});

	describe('clicking anywhere on the calendar', function() {
		it('creates a new event', function() {
			expect(scope.events.length).toEqual(0);
			var time = new Date();
			scope.uiConfig.calendar.dayClick(time);
			var startUnixTimestamp = moment(time).unix();
			expect(scope.events[0].start).toEqual(startUnixTimestamp);
			expect(scope.events[0].end).toEqual(startUnixTimestamp + 1800);
      expect(scope.events[0].duration).toEqual(1800);
		});
	});

	describe('dragging an event', function() {
		beforeEach(function() {
			scope.events = [
				{
					title: 'first event',
					start: new Date(2020, 3, 3, 12, 0, 0),
					end: new Date(2020, 3, 3, 12, 30, 0),
					duration: 1800
				},
				// Twice as long
				{
					title: 'second event',
					start: new Date(2020, 3, 3, 12, 30, 0),
					end: new Date(2020, 3, 3, 13, 30, 0),
					duration: 3600
				},
				// Has a gap between it and last event
				{
					title: 'third event',
					start: new Date(2020, 3, 3, 14, 30, 0),
					end: new Date(2020, 3, 3, 15, 0, 0),
					duration: 1800
				}
			];
		});

		it('moves the event to the appropriate spot in the list', function() {
			// Moved forward to the start of the 3rd event
			var minuteDelta = 150;
			var movedEvent = scope.events[0];
			// Moved event is already updated by the time eventDrop() fires
			movedEvent.start = new Date(2020, 3, 3, 14, 30, 0); 
			movedEvent.end = new Date(2020, 3, 3, 15, 0, 0);
			scope.uiConfig.calendar.eventDrop(movedEvent, null, minuteDelta);
			// Is currently moved to right before the 3rd event (may be bad)
			expect(scope.events.indexOf(movedEvent)).toEqual(1);
		});

		it('displaces existing events', function() {
			// Moved forward to the start of the 3rd event
			var minuteDelta = 150;
			var movedEvent = scope.events[0];
			// Moved event is already updated by the time eventDrop() fires
			movedEvent.start = new Date(2020, 3, 3, 14, 30, 0);
			movedEvent.end = new Date(2020, 3, 3, 15, 0, 0);
			scope.uiConfig.calendar.eventDrop(movedEvent, null, minuteDelta);
			// Second event was moved to occupy the first's original slot
			expect(scope.events[0].title).toEqual('second event');
			expect(scope.events[0].start.getHours()).toEqual(12);
			expect(scope.events[0].start.getMinutes()).toEqual(0);
			expect(scope.events[0].end.getHours()).toEqual(13);
			expect(scope.events[0].end.getMinutes()).toEqual(0);
		});

		it('can move events backwards in time');
	});

	describe('resizing an event', function() {
		it('adjusts all events after the resized one', function() {
			scope.events = [
				{
					title: 'first event',
					start: new Date(2020, 3, 3, 12, 0, 0),
					end: new Date(2020, 3, 3, 12, 30, 0),
					duration: 1800
				},
				// Twice as long
				{
					title: 'second event',
					start: new Date(2020, 3, 3, 12, 30, 0),
					end: new Date(2020, 3, 3, 13, 30, 0),
					duration: 3600
				}
			];
			scope.uiConfig.calendar.eventResize(scope.events[0], null, 60);
			expect(scope.events[1].start.getHours()).toEqual(13);
			expect(scope.events[1].end.getHours()).toEqual(14);
		});
	});

	it('allows a cutoff time to prevent events after a given time', function() {
		scope.uiConfig.cutoffTime = 10;
		scope.allEvents = [
			{title: 'first'},
			{title: 'second'},
			{title: 'past cutoff'}
		];
		scope.$apply();
		expect(scope.events.length).toEqual(2);
	});

  describe('clearing a schedule', function() {
    describe('when one has been saved', function() {
      var savedSchedule;
      beforeEach(inject(function($controller, $httpBackend) {
        savedSchedule = {
            _id: 'scheduleid',
            events: [{
              title: 'an event'
            }]
        };
        
        $controller('ScheduleController', {
          $scope: scope, 
          savedSchedule: savedSchedule
        });
      }));

      it('deletes the schedule when one has been saved', inject(function($httpBackend) {
        $httpBackend.expectDELETE('/schedules/scheduleid').respond(200);
        
        scope.events.push(savedSchedule.events[0]);

        var oldEvents = scope.events;
        scope.allEvents = scope.events;
        var oldAllEvents = scope.allEvents;

        scope.clear();
        $httpBackend.flush();
        // angular requires maintaining object references
        expect(scope.events === oldEvents).toBeTruthy();
        expect(scope.allEvents === oldAllEvents).toBeTruthy();
        expect(scope.events.length).toEqual(0);
        expect(scope.allEvents.length).toEqual(0);
      }));

      it('sets the state back to home when clearing a saved schedule', inject(function($httpBackend, $location) {
        $httpBackend.expectDELETE('/schedules/scheduleid').respond(200);

        scope.clear();
        $httpBackend.flush();
        expect($location.path()).toEqual('/');
      }));
    });
   
    it('can clear events even if none have been loaded from csv', inject(function($httpBackend) {
      scope.events.push({
        title: 'an event'
      });
      var oldEvents = scope.events;

      scope.clear();
      $httpBackend.verifyNoOutstandingExpectation();
      // angular requires maintaining object references
      expect(scope.events === oldEvents).toBeTruthy();
      expect(scope.events.length).toEqual(0);
    }));
  });

	// Test randomize events

});	