var gtdPanic = angular.module('GtdPanic', ['ui.calendar', 'angularFileUpload']);

gtdPanic.controller('UploadController', function($scope, $upload, $rootScope) {
	$scope.onSelectCsv = function($files) {
		var $file = $files[0];
      	$scope.upload = $upload.upload({
        	url: '/omnifocus_upload', //upload.php script, node.js route, or servlet url
        	method: 'POST',
        	// headers: {'headerKey': 'headerValue'}, withCredential: true,
        	// data: {myObj: $scope.myModelObj},
        	file: $file,
      }).progress(function(evt) {
        console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
      }).success(function(events, status, headers, config) {
        $rootScope.allEvents = events;
      })
      .error(function() {
      	console.error('File failed to upload');
      });
	}
});

gtdPanic.controller('ScheduleController', function($scope) {
	$scope.uiConfig = {
		calendar: {
			header: {
				right: 'title'
			},
			defaultView: 'agendaDay'
		}
	};

	$scope.eventSources = [];

	$scope.$watch('allEvents', function(allEvents) {
		if (!allEvents) {
			return;
		}
		var eventConfig = {
			events: allEvents
		};
		$scope.eventSources.push(eventConfig);
		console.log($scope.eventSources);
	});
});