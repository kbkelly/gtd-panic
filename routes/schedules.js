var async = require('async');

exports.create = function(db) {
  return function createSchedule(req, res){
    var schedules = db.get('schedules');
    var eventsToInsert = req.body;
    schedules.insert({
      events: eventsToInsert
    }, function(err, schedule) {
      if (err) throw err;
      res.json(schedule);
    });
  };
}

// Display a previously created schedule
exports.show = function(db) {
  return function(req, res) {
    var schedules = db.get('schedules');
    schedules.findById(req.params.id, function(err, schedule) {
      if (err) {
        throw err;
      } else if (!schedule) {
        console.log('Find failed: ', err);
        res.send(404);
      } else {
        res.json(schedule.events);
      }      
    });
  }
}

// exports.today = function(req, res) {
//   var start = new Date();
//   start.setHours(0);
//   start.setMinutes(0);
//   start.setSeconds(0);
//   var end = new Date();
//   end.setHours(23);
//   end.setMinutes(59);
//   end.setSeconds(59);
//   Event.findAll({where: ['start > ? and start < ?', start, end]}).success(function(events) {
//     res.json(events);
//   });
// }

exports.clear = function(db) {
  return function(req, res) {
    var schedules = db.get('schedules');
    schedules.remove({_id: req.params.id}, function(err) {
      if (err) throw err;
      res.send(200);
    });
  }
}