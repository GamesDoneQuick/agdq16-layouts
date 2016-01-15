'use strict';

var fs = require('fs');
var path = require('path');
var rp = require('request-promise');
var clone = require('clone');
var Q = require('q');
var equals = require('deep-equal');

var POLL_INTERVAL = 60 * 1000;

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

        var runnersPromise = rp({
            uri: 'https://gamesdonequick.com/tracker/search',
            qs: {
                type: 'runner',
                event: 17
            },
            json: true
        });

        var schedulePromise = rp({
            uri: 'https://gamesdonequick.com/tracker/search',
            qs: {
                type: 'run',
                event: 17
            },
            json: true
        });

        return Q.spread([runnersPromise, schedulePromise], function(runnersJSON, scheduleJSON) {
            var allRunners = [];
            runnersJSON.forEach(function(obj) {
                obj.fields.stream = obj.fields.stream.split('/').pop();
                allRunners[obj.pk] = obj.fields;
            });

            /* jshint -W106 */
            var formattedSchedule = scheduleJSON.map(function(run) {
                var boxartUrl = '/graphics/agdq16-layouts/img/boxart/default.png';
                var boxartName = new Buffer(run.fields.display_name).toString('base64');
                var boxartPath = path.resolve(__dirname, '../graphics/img/boxart/', boxartName +'.jpg');

                if (fs.existsSync(boxartPath)) {
                    boxartUrl = '/graphics/agdq16-layouts/img/boxart/' + boxartName + '.jpg';
                }

                var runners = run.fields.runners.map(function(runnerId) {
                    return allRunners[runnerId];
                });

                var concatenatedRunners;
                if (runners.length === 1) {
                    concatenatedRunners = runners[0].name;
                } else {
                    concatenatedRunners = runners.reduce(function(prev, curr) {
                        if (typeof prev === 'object') {
                            return prev.name + ', ' + curr.name;
                        } else {
                            return prev + ', ' + curr.name;
                        }
                    });
                }

                return {
                    name: run.fields.display_name || 'Unknown',
                    console: run.fields.console || 'Unknown',
                    commentators: run.fields.commentators || 'Unknown',
                    category: run.fields.category || 'Any%',
                    startTime: Date.parse(run.fields.starttime) || null,
                    order: run.fields.order,
                    estimate: run.fields.run_time || 'Unknown',
                    releaseYear: run.fields.release_year,
                    runners: runners,
                    concatenatedRunners: concatenatedRunners,
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

            // TODO: This is commented out because it blows away any manual edits made to currentRun.
            // TODO: Need to figure out a merge system that preserves manual edits when they don't conflict.
            /*// Else, update the currentRun
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
            }*/
        }).catch(function(err) {
            nodecg.log.error('[schedule] Failed to update:', err.stack);
        });
    }

    function _setCurrentRun(run) {
        var cr = clone(run);

        // `order` is always `index+1`. So, if there is another run in the schedule after this one, add it as `nextRun`.
        if (scheduleRep.value[cr.order]) {
            cr.nextRun = scheduleRep.value[cr.order];
        }

        currentRun.value = cr;
    }
};
