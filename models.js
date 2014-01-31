var Sequelize = require('sequelize');
var sqlite3 = require("sqlite3").verbose();
var file = process.env["DB"];

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

var Schedule = db.define('Schedule', {
  guid: Sequelize.STRING
});

Schedule.hasMany(Event);
Event.belongsTo(Schedule);

exports.db = db;
exports.Schedule = Schedule;
exports.Event = Event;