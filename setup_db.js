// TODO: Cleanup duplication
var Sequelize = require('sequelize');
var file = "./test.db";

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

var Schedule = db.define('Schedule', {});

Schedule.hasMany(Event);
Event.belongsTo(Schedule);

console.log('setting up database');
db.sync({force: true}).complete(function(err) {
	console.log('finished sync');
	if (!!err) {
		console.log('boom!', err);
	} else {
		console.log('it worked!');
	}
});