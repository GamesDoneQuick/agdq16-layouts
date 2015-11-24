'use strict';

var SCHEDULE_URL = 'https://gamesdonequick.com/tracker/search/?type=run&event=17';
var POLL_INTERVAL = 3 * 60 * 1000;
var BOXART_ASPECT_RATIO = 1.397;
var BOXART_WIDTH = 469;
var BOXART_HEIGHT = Math.round(BOXART_WIDTH * BOXART_ASPECT_RATIO);
var BOXART_DEFAULT_URL = 'http://static-cdn.jtvnw.net/ttv-static/404_boxart-'+BOXART_WIDTH+'x'+BOXART_HEIGHT+'.jpg';

var request = require('request');
var clone = require('clone');
var Q = require('q');
var format = require('util').format;

module.exports = function (nodecg) {
    var scheduleRep = nodecg.Replicant('schedule', {defaultValue: [], persistent: false});
    var currentRun = nodecg.Replicant('currentRun', {defaultValue: {}});

    // Get initial data
    update();

    // Get latest schedule data every POLL_INTERVAL milliseconds
    nodecg.log.info('Polling schedule every %d seconds...', POLL_INTERVAL / 1000);
    var updateInterval = setInterval(update.bind(this), POLL_INTERVAL);

    // Dashboard can invoke manual updates
    nodecg.listenFor('updateSchedule', function(data, cb) {
        nodecg.log.info('Manual schedule update button pressed, invoking update...');
        clearInterval(updateInterval);
        updateInterval = setInterval(update.bind(this), POLL_INTERVAL);
        update()
            .then(function (updated) {
                if (updated) {
                    nodecg.log.info('Schedule successfully updated');
                } else {
                    nodecg.log.info('Schedule unchanged, not updated');
                }

                cb(null, updated);
            }, function (error) {
                cb(error);
            });
    });

    function update() {
        var deferred = Q.defer();

        request(SCHEDULE_URL, function(err, res, body) {
            if (!err && res.statusCode === 200) {
                var json = JSON.parse(body);

                /* jshint -W106 */
                var formattedSchedule = json.map(function(run) {
                    var boxartUrl = typeof run.fields.boxart_template === 'string'
                        ? run.fields.boxart_template.replace('{width}', BOXART_WIDTH).replace('{height}', BOXART_HEIGHT)
                        : BOXART_DEFAULT_URL;

                    return {
                        name: run.fields.name || 'Unknown',
                        console: run.fields.console || 'Unknown',
                        commentators: run.fields.commentators || 'Unknown',
                        category: run.fields.description || 'Any%',
                        startTime: Date.parse(run.fields.starttime) || null,
                        order: run.fields.order,
                        estimate: run.fields.run_time || 'Unknown',
                        runners: run.fields.runners || [],
                        boxart: {
                            url: boxartUrl,
                            width: BOXART_WIDTH,
                            height: BOXART_HEIGHT,
                            aspectRatio: BOXART_ASPECT_RATIO
                        },
                        type: 'run'
                    };
                });
                /* jshint +W106 */

                // If no currentRun is set, set one
                if (typeof(currentRun.value.game) === 'undefined') {
                    var cr = clone(formattedSchedule[0]);
                    if (formattedSchedule.length > 1) cr.nextRun = formattedSchedule[1];
                    currentRun.value = cr;
                }

                scheduleRep.value = formattedSchedule;
                deferred.resolve(true);
            } else {
                var msg = format('Could not get schedule, unknown error');
                if (err) msg = format('Could not get schedule:', err.message);
                else if (res) msg = format('Could not get schedule, response code %d', res.statusCode);
                nodecg.log.error(msg);
                deferred.reject(msg);
            }
        });

        return deferred.promise;
    }
};
