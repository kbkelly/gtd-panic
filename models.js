var Sequelize = require('sequelize');
var sqlite3 = require("sqlite3").verbose();
var file = "test.db";

var db = new Sequelize('database', 'username', 'password', {
  dialect: 'sqlite',     
  storage: file
});

var Event = db.define('Event', {
    title: Sequelize.STRING,
    start: Sequelize.DATE,
    end: Sequelize.DATE,
    ScheduleId: Sequelize.INTEGER
});

Event.count = function(callback) {
  db.query('select count(*) from events')
    .success(function(res) {
      callback(res[0]['count(*)']);
    });
}

var Schedule = db.define('Schedule', {
});

Schedule.hasMany(Event);
Event.belongsTo(Schedule);

exports.db = db;
exports.Schedule = Schedule;
exports.Event = Event;