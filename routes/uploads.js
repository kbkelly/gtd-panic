var fs = require('fs'),
	csv = require('csv');

// Upload a CSV and convert it to events
exports.create = function(req, res){
	var results = [];
	csv()
	.from.path(req.files.file.path,
		{ delimiter: ',', escape: '"' })
	.on('record', function(row, index){
		// Skip header row
		if (index === 0) {
			return;
		}

		var event = convertRowToEvent(row);
		if (event) {
			results.push(event);
		}
	})
	.on('end', function(count) {
		res.json(results);
	})
	.on('error', function(error) {
		console.log('error', error);
	});

	function convertRowToEvent(row) {
		// Missing task title
		if (row.length < 3) {
			return;
		}

		// Only show actions
		if (row[1] !== 'Action') {
			return;
		}

		// Skip Waiting context
		if (row.length > 4 && row[4] === "Waiting") {
			return;
		}

		var duration = null;
		if (row.length > 8 && row[8] !== '') {
			duration = durationToSeconds(row[8]);
		}

		return {
			title: row[2],
			duration: duration
		};
	}

	function durationToSeconds(duration) {
		var timeRegex = /(\d+)m/;
		var matches = duration.match(timeRegex);
		if (!matches) {
			return;
		}
		return matches[1] * 60;
	}
};