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
					start: 120000,
					end: 130000
				},
				// Twice as long
				{
					title: 'second event',
					start: 130000,
					end: 150000
				},
				// Has a gap between it and last event
				{
					title: 'third event',
					start: 160000,
					end: 170000
				}
			];
		});

		it('moves the event to the appropriate spot in the list', function() {
			// Moved forward to the start of the 3rd event
			var minuteDelta = (160000 - 120000) / 60;
			var movedEvent = scope.events[0];
			// Moved event is already updated by the time eventDrop() fires
			movedEvent.start = 160000; 
			scope.uiConfig.calendar.eventDrop(movedEvent, null, minuteDelta);
			scope.$apply();
			// Is currently moved to right before the 3rd event (may be bad)
			expect(scope.events.indexOf(movedEvent)).toEqual(1);
		});

		it('displaces existing events');

		it('can move events backwards in time');
	});

	// Test eventDrop
	// Test eventResize
	// Test cutoff time
	// Test randomize events

});	