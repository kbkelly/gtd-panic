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

	// Test cutoff time
	// Test randomize events
	// Test dayClick
	// Test eventDrop

});	