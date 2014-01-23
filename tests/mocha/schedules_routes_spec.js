var assert = require('assert'),
  request = require('supertest'),
  schedules = require('../../routes/schedules'),
  app = require('../../app'),
  models = require('../../models'),
  async = require('async');

describe('schedules', function(){
  before(function(done) {
    models.db.query('delete from events').complete(done);
  });

  describe('#create', function(){
    it('should save some events', function(done){
      var postBody = [
        {title: 'first', start: 'fdsafsd'}
      ];
      request(app)
        .post('/schedules')
        .send(postBody)
        .end(function(err, res) {
          if (err) {
            throw err;
          }
          assert.equal(res.status, 200);
          models.Event.count(function(count) {
            assert.equal(1, count);
            done();
          });
        });
    });

    it('should update pre-existing events', function(done) {
      async.waterfall([
        function setup(callback) {
          models.Event.create({title: 'foobar'}).complete(callback);
        },
        function update(event, callback) {
          request(app)
            .post('/schedules')
            .send([{id: event.id, title: 'new title'}])
            .end(function(err, res) {
              callback(err, event);
            });
        },
        function fetchUpdatedEvent(event, callback) {
          models.Event.find(event.id).success(callback);
        }
      ], function(updatedEvent) {
        assert.equal(updatedEvent.title, 'new title');
        done();
      });
    });
  })
});