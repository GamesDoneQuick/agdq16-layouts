'use strict';

var SCHEDULE_URL = 'https://gamesdonequick.com/tracker/search/?type=run&event=17';
var POLL_INTERVAL = 60 * 1000;
var BOXART_ASPECT_RATIO = 1.397;
var BOXART_WIDTH = 469;
var BOXART_HEIGHT = Math.round(BOXART_WIDTH * BOXART_ASPECT_RATIO);
var BOXART_DEFAULT_URL = '/graphics/agdq16-layouts/img/placeholder/boxart.png';

var request = require('request');
var clone = require('clone');
var Q = require('q');
var format = require('util').format;
var equals = require('deep-equal');

module.exports = function (nodecg) {
    var checklist = require('./checklist')(nodecg);
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

    nodecg.listenFor('nextRun', function(cb) {
        var nextIndex = currentRun.value.nextRun.order - 1;
        _setCurrentRun(scheduleRep.value[nextIndex]);
        checklist.reset();

        if (typeof cb === 'function') {
            cb();
        }
    });

    nodecg.listenFor('previousRun', function(cb) {
        var prevIndex = currentRun.value.order - 2;
        _setCurrentRun(scheduleRep.value[prevIndex]);
        checklist.reset();

        if (typeof cb === 'function') {
            cb();
        }
    });

    nodecg.listenFor('setCurrentRunByOrder', function(order, cb) {
        _setCurrentRun(scheduleRep.value[order - 1]);

        if (typeof cb === 'function') {
            cb();
        }
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
                        releaseYear: run.fields.release_year,
                        runners: run.fields.runners || [],
                        concatenatedRunners: run.fields.runners.reduce(function(prev, curr) {
                            if (typeof prev === 'object') {
                                return prev.name + ', ' + curr.name;
                            } else {
                                return prev + ', ' + curr.name;
                            }
                        }),
                        boxart: {
                            url: boxartUrl
                        },
                        type: 'run'
                    };
                });
                /* jshint +W106 */

                // If nothing has changed, return.
                if (equals(formattedSchedule, scheduleRep.value)) {
                    deferred.resolve(false);
                    return;
                }

                scheduleRep.value = formattedSchedule;

                // If no currentRun is set or if the order of the current run is greater than
                // the length of the schedule, set current run to the first run.
                if (typeof(currentRun.value.order) === 'undefined'
                    || currentRun.value.order > scheduleRep.value.length) {

                    _setCurrentRun(scheduleRep.value[0]);
                }

                // Else, update the currentRun
                else {
                    // First, try to find the current run by name.
                    var updatedCurrentRun = formattedSchedule.some(function(run) {
                        if (run.name === currentRun.value.name) {
                            _setCurrentRun(run);
                            return true;
                        }
                    });

                    // If that fails, try to update it by order.
                    if (!updatedCurrentRun) {
                        formattedSchedule.some(function(run) {
                            if (run.order === currentRun.value.order) {
                                _setCurrentRun(run);
                                return true;
                            }
                        });
                    }
                }

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

    function _setCurrentRun(run) {
        var cr = clone(run);
        if (scheduleRep.value[cr.order]) cr.nextRun = scheduleRep.value[cr.order];

        if (!equals(cr, currentRun.value)) {
            currentRun.value = cr;
        }
    }
};
