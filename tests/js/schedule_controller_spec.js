describe('ScheduleController', function() {
	beforeEach(module('GtdPanic'));

	var scope, controller;
	beforeEach(inject(function($rootScope, $controller) {
		scope = $rootScope.$new();
		controller = $controller('ScheduleController', {$scope:scope});
	}));

	it('sets up the default calendar config', function() {
		expect(scope.uiConfig.defaultDuration).toEqual(30);
		expect(scope.uiConfig.cutoffTime).toEqual(23); // 11pm
	});

	it('properly configures timing of incoming events', function() {
		var events = [
			{title: 'first event'},
			{title: 'second event'}
		];
		scope.allEvents = events;
		scope.$apply();
		expect(events[0].start).toBeDefined();
		expect(events[0].end).toBeDefined();
		// Default duration
		expect(events[0].start + 1800).toEqual(events[0].end);
		// Proper chronological ordering
		expect(events[1].start).toEqual(events[0].end);

		expect(scope.eventSources[0]).toEqual(events);
	});

	it('allows events to have a predefined duration', function() {
		var events = [
			{title: 'first event', duration: 3600},
			{title: 'second event'}
		];
		// Inject the events
		scope.allEvents = events;
		scope.$apply();

		expect(events[0].end).toEqual(events[0].start + 3600);
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

	it('can save events', inject(function($httpBackend) {
		scope.events = [
			{title: 'saved event'}
		];
		$httpBackend.expectPOST('/schedules', scope.events).respond(200);
		scope.save();
		$httpBackend.flush();
		$httpBackend.verifyNoOutstandingExpectation();
	}));

	describe('clicking anywhere on the calendar', function() {
		it('creates a new event', function() {
			expect(scope.events.length).toEqual(0);
			var time = new Date();
			scope.uiConfig.calendar.dayClick(time);
			var startUnixTimestamp = moment(time).unix();
			expect(scope.events[0].start).toEqual(startUnixTimestamp);
			expect(scope.events[0].end).toEqual(startUnixTimestamp + 1800);
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

	// Test cutoff time
	// Test randomize events

});	