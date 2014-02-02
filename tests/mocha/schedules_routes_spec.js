var assert = require('chai').assert,
  request = require('supertest'),
  app = require('../../app'),
  async = require('async'),
  monk = require('monk'),
  db = monk(process.env["MONGOHQ_URL"]);

describe('schedules', function(){
  var schedules;
  beforeEach(function(done) {
    schedules = db.get('schedules');
    schedules.remove(done);
  });

  describe('#create', function(){
    it('should save some events', function(done){
      var postBody = {
        events: [
          {title: 'first', start: 'fdsafsd'}
        ]
      };
      request(app)
        .post('/schedules')
        .send(postBody)
        .end(function(err, res) {
          if (err) done(err);
          assert.equal(res.status, 200);
          assert.isNotNull(res.body._id);
          assert.equal(res.body.events.length, 1);
          assert.equal(res.body.events[0].title, 'first');
          done();
        });
    });

    it('should update pre-existing schedules', function(done) {
      schedules.insert({
        events: [
          {title: 'foobar'}
        ],
      }, function(err, schedule) {
        if (err) done(err);
        assert.isNotNull(schedule._id);
        request(app)
          .put('/schedules/' + schedule._id)
          .send({
            events: [
              {_id: schedule.events[0]._id, title: 'new title'}
            ]
          })
          .end(function(err, res) {
            if (err) done(err);
            schedules.findById(schedule._id, function(err, updatedSchedule) {
              if (err) done(err);
              assert.equal(updatedSchedule.events[0].title, 'new title');
              done();
            });
          });
      });
    });
  });

  describe('#clear', function() {
    it('deletes the schedule in question', function(done) {
      schedules.insert({
        events: [
          {title: 'foobar event title'}
        ],
      }, function(err, schedule) {
        if (err) done(err);
        assert.isNotNull(schedule._id);
        request(app)
          .del('/schedules/' + schedule._id)
          .end(function(err, res) {
            if (err) done(err);
            schedules.count({}, function(err, count) {
              if (err) done(err);
              assert.equal(0, count);
              done();
            })
          });
      });
    });
  });

  describe('#show', function() {
    it('returns a given schedule', function(done) {
      schedules.insert({
        events: [
          {title: 'foobar event title'}
        ],
      }, function(err, schedule) {
        assert.isNotNull(schedule._id);
        request(app)
          .get('/schedules/' + schedule._id)
          .end(function(err, res) {
            assert.equal(res.body._id, schedule._id);
            assert.equal(res.body.events.length, 1);
            assert.equal(res.body.events[0].title, 'foobar event title');
            done(err);
          });
      });
    });
  });
});