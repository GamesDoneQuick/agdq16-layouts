'use strict';

var fs = require('fs');
var request = require('request');
var schedule = JSON.parse(fs.readFileSync('schedule.json'));
var failed = [];

fetchBoxart(schedule[0]);

function fetchBoxart(run) {
    console.log('Fetching %s...', run.boxart.url);

    var filename = new Buffer(run.name).toString('base64');
    var filepath = 'graphics/img/boxart/' + filename + '.jpg';

    var stream = request(run.boxart.url);
    stream.pipe(fs.createWriteStream(filepath));

    stream.on('error', function(err) {
        failed.push(run);
        console.error('Failed to fetch', run.boxart.url);
        fetchNext(run);
    });

    stream.on('end', function() {
        console.log('Successfully fetched', run.boxart.url);
        fetchNext(run);
    });
}

function fetchNext(run) {
    if (run.order < schedule.length - 2) {
        fetchBoxart(schedule[run.order]);
    } else {
        if (failed.length > 0) {
            console.warn('%s downloads failed, writing to failed.json', failed.length);
            fs.writeFileSync('failed.json', JSON.stringify(failed));
        }
    }
}
