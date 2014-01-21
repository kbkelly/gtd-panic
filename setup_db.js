var models = require('./models');

var db = models.db;

console.log('setting up database');
db.sync({force: true}).complete(function(err) {
	console.log('finished sync');
	if (!!err) {
		console.log('boom!', err);
	} else {
		console.log('it worked!');
	}
});