var async = require('async');

exports.create = function(db) {
  return function createSchedule(req, res){
    var schedules = db.get('schedules');
    var eventsToInsert = req.body.events;
    schedules.insert({
      events: eventsToInsert
    }, function(err, schedule) {
      if (err) {
        res.send(err);
      } else {
        res.json(schedule);
      }
    });
  };
};

exports.update = function(db) {
  return function(req, res) {
    var schedules = db.get('schedules');
    function scrubInput(json) {
      return {
        events: json.events
      };
    }
    schedules.findAndModify({_id: req.params.id}, {$set: scrubInput(req.body)}, function(err, schedule) {
      if (err) {
        res.send(err);
      } else {
        res.send(schedule);
      }
    });
  };
};

// Display a previously created schedule
exports.show = function(db) {
  return function(req, res) {
    var schedules = db.get('schedules');
    schedules.findById(req.params.id, function(err, schedule) {
      if (err) {
        res.send(err);
      } else if (!schedule) {
        res.send(404);
      } else {
        res.json(schedule);
      }
    });
  };
};

exports.clear = function(db) {
  return function(req, res) {
    var schedules = db.get('schedules');
    schedules.remove({_id: req.params.id}, function(err) {
      if (err) {
        res.send(err);
      } else {
        res.send(200);
      }
    });
  };
};