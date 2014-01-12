var Sequelize = require('sequelize');
var sqlite3 = require("sqlite3").verbose();
var async = require('async');
var file = "test.db";

var db = new Sequelize('database', 'username', 'password', {
  dialect: 'sqlite',	 
  storage: file
});

var Event = db.define('Event', {
	Title: Sequelize.STRING,
	Start: Sequelize.STRING,
	End: Sequelize.STRING,
	ScheduleId: Sequelize.INTEGER
});

var Schedule = db.define('Schedule', {
});

Schedule.hasMany(Event);
Event.belongsTo(Schedule);

// var exists = fs.existsSync(file);
// var db = new sqlite3.Database(file);
// Create a new schedule
exports.create = function(req, res){
	saveEvents(req.body, function(events) {
			console.log('Events', events.length);
			res.json(events);
	});
};

function saveEvents(eventsJson, done) {
	Schedule.create({}).complete(function (err, schedule) {
		if (!!err) {
			console.log('The schedule has not been saved:', err);
		}
		// Create a set of events and associate with the schedule
		async.map(eventsJson, function toEvent(eventJson, callback) {
			Event.create(eventJson).complete(function(err, event) {
				if (!!err) {
					console.log('The event has not been saved:', err);
				}
				schedule.addEvent(event).complete(function(err) {
					if (!!err) {
						console.log('The event has not been added to the schedule:', err);
					}
					callback(err, event);					
				});
			});
		}, function final(err, events) {
			done(events);
		});
	});
}

// Display a previously created schedule
exports.show = function(req, res) {
	
}