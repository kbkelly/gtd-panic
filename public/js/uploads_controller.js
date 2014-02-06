gtdPanic.controller('UploadController', function($scope, $upload, $rootScope) {
  $scope.onSelectCsv = function($files) {
    var $file = $files[0];
        $scope.upload = $upload.upload({
          url: '/omnifocus_upload',
          method: 'POST',
          file: $file,
      })
        .success(function(events, status, headers, config) {
        $rootScope.$emit('uploadedEvents', events);
      })
      .error(function() {
        console.error('File failed to upload');
      });
  };
});