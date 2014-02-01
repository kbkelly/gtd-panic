// Karma configuration
// Generated on Sat Jan 04 2014 13:56:30 GMT-0800 (PST)

module.exports = function(config) {
  config.set({

    // base path, that will be used to resolve files and exclude
    basePath: '',


    // frameworks to use
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
        'public/components/jquery/jquery.js',
        'public/components/jquery-ui/ui/jquery-ui.js',
        'public/components/angular/angular.js',
        'public/components/angular-mocks/angular-mocks.js', // Specs only
        'public/components/angular-ui-calendar/src/calendar.js',
        'public/components/fullcalendar/fullcalendar.js',
        'public/components/fullcalendar/gcal.js',
        'public/components/angular-ui-router/release/angular-ui-router.js',
        'public/components/ng-file-upload/angular-file-upload.js',
        'public/components/momentjs/moment.js',
        'public/vendor/twix.js',
        'public/components/underscore/underscore.js',
        'public/js/*.js',
        'tests/js/*spec.js'
    ],


    // list of files to exclude
    exclude: [
      
    ],


    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
    reporters: ['dots'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera (has to be installed with `npm install karma-opera-launcher`)
    // - Safari (only Mac; has to be installed with `npm install karma-safari-launcher`)
    // - PhantomJS
    // - IE (only Windows; has to be installed with `npm install karma-ie-launcher`)
    browsers: ['Chrome'],


    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000,


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false
  });
};
