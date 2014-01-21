var Sequelize = require('sequelize');
var sqlite3 = require("sqlite3").verbose();
var async = require('async');
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

var Schedule = db.define('Schedule', {
});

Schedule.hasMany(Event);
Event.belongsTo(Schedule);

exports.db = db;
exports.Schedule = Schedule;
exports.Event = Event;