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

	// Test randomize events
	// Test dayClick
	// Test eventDrop

});	