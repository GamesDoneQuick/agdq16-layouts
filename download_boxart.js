/* jshint -W106 */
'use strict';

var fs = require('fs');
var rp = require('request-promise');
var request = require('request');
var failed = [];

var schedule;
rp({
    uri: 'https://gamesdonequick.com/tracker/search',
    qs: {
        type: 'run',
        event: 17
    },
    json: true
}).then(function(s) {
    schedule = s;
    fetchBoxart(schedule[0]);
});

function fetchBoxart(run) {
    var boxartUrl = 'http://static-cdn.jtvnw.net/ttv-boxart/'+run.fields.name+'-469x655.jpg';
    console.log('Fetching %s...', boxartUrl);

    var filename = new Buffer(run.fields.display_name).toString('base64');
    var filepath = 'graphics/img/boxart/' + filename + '.jpg';

    var stream = request(boxartUrl);
    stream.pipe(fs.createWriteStream(filepath));

    stream.on('error', function(err) {
        failed.push(run);
        console.error('Failed to fetch', boxartUrl);
        fetchNext(run);
    });

    stream.on('end', function() {
        console.log('Successfully fetched', boxartUrl);
        fetchNext(run);
    });
}

function fetchNext(run) {
    if (run.fields.order < schedule.length - 2) {
        fetchBoxart(schedule[run.fields.order]);
    } else {
        if (failed.length > 0) {
            console.warn('%s downloads failed, writing to failed.json', failed.length);
            fs.writeFileSync('failed.json', JSON.stringify(failed));
        }
    }
}
