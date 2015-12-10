'use strict';

var clone = require('clone');
var Rieussec = require('rieussec');
var NUM_STOPWATCHES = 4;

module.exports = function (nodecg) {
    var defaultStopwatch = {time: '00:00:00', state: 'stopped', milliseconds: 0, runnerName: '?', place: 0};
    var stopwatches = nodecg.Replicant('stopwatches', {
        defaultValue: [
            clone(defaultStopwatch),
            clone(defaultStopwatch),
            clone(defaultStopwatch),
            clone(defaultStopwatch)
        ]
    });

    // Add the runner's name to the stopwatch, because testrunner needs that for his API stuff.
    var currentRun = nodecg.Replicant('currentRun');
    currentRun.on('change', function(oldVal, newVal) {
        var i;
        if (newVal.runners) {
            for (i = 0; i < NUM_STOPWATCHES; i++) {
                var runner = newVal.runners[i];
                stopwatches.value[i].runnerName = runner ? runner.name : '?';
            }
        } else {
            for (i = 0; i < NUM_STOPWATCHES; i++) {
                stopwatches.value[i].runnerName = '?';
            }
        }

    });

    // Make an array of 4 Rieussec stopwatches
    var rieussecs = [null, null, null, null].map(function(val, index) {
        var stopwatch =  stopwatches.value[index];

        // Load the existing time and start the stopwatch at that.
        var startMs = 0;
        if (stopwatch.time) {
            var ts = stopwatch.time.split(':');
            startMs = Date.UTC(1970, 0, 1, ts[0], ts[1], ts[2]);

            if (stopwatch.state === 'running') {
                startMs += Date.now() - stopwatch.lastTick;
            }
        }

        var rieussec = new Rieussec();
        rieussec.setMilliseconds(startMs);

        if (stopwatch.state === 'running') {
            rieussec.start();
        }

        rieussec.on('tick', function(ms) {
            stopwatch.time = msToTime(ms);
            stopwatch.milliseconds = ms;

            if (stopwatch.state === 'running') {
                stopwatch.lastTick = Date.now();
            } else {
                stopwatch.lastTick = null;
            }
        });

        return rieussec;
    });

    var handleStartTimeRequest = function(index) {
        if (index === 'all') {
            for (var i = 0; i < NUM_STOPWATCHES; i++) {
                startStopwatch(i);
            }
            return stopwatches.value;
        } else {
            return startStopwatch(index);
        }
    };

    var handlePauseTimeRequest = function(index) {
        if (index === 'all') {
            for (var i = 0; i < NUM_STOPWATCHES; i++) {
                pauseStopwatch(i);
            }
            return stopwatches.value;
        } else {
            return pauseStopwatch(index);
        }
    };

    var handleFinishTimeRequest = function(index) {
        if (index === 'all') {
            for (var i = 0; i < NUM_STOPWATCHES; i++) {
                finishStopwatch(i);
            }
            return stopwatches.value;
        } else {
            return finishStopwatch(index);
        }
    };

    var handleResetTimeRequest = function(index, cb) {
        var retValue;

        if (index === 'all') {
            for (var i = 0; i < NUM_STOPWATCHES; i++) {
                resetStopwatch(i);
            }
            retValue = stopwatches.value;
        } else {
            retValue = resetStopwatch(index);
        }

        if (typeof cb === 'function') {
            cb(retValue);
        }

        return retValue;
    };

    var handleSetTimeRequest = function(data, cb) {
        var retValue;

        if (data.index === 'all') {
            for (var i = 0; i < NUM_STOPWATCHES; i++) {
                setStopwatch({index: i, ms: data.milliseconds});
            }
            retValue = stopwatches.value;
        } else {
            retValue = setStopwatch(data);
        }

        if (typeof cb === 'function') {
            cb();
        }

        return retValue;
    };

    nodecg.listenFor('startTime', handleStartTimeRequest);

    nodecg.listenFor('pauseTime', handlePauseTimeRequest);

    nodecg.listenFor('finishTime', handleFinishTimeRequest);

    nodecg.listenFor('resetTime', handleResetTimeRequest);

    nodecg.listenFor('setTime', handleSetTimeRequest);

    function startStopwatch(index) {
        if (index < 0 || index >= NUM_STOPWATCHES) {
            nodecg.log.error('index "%d" sent to "startStopwatch" is out of bounds', index);
            return;
        }

        rieussecs[index].start();
        stopwatches.value[index].state = 'running';
        recalcPlaces();
        return stopwatches.value[index];
    }

    function pauseStopwatch(index) {
        if (index < 0 || index >= NUM_STOPWATCHES) {
            nodecg.log.error('index "%d" sent to "pauseStopwatch" is out of bounds', index);
            return;
        }

        rieussecs[index].pause();
        stopwatches.value[index].state = 'paused';
        recalcPlaces();
        return stopwatches.value[index];
    }

    function finishStopwatch(index) {
        if (index < 0 || index >= NUM_STOPWATCHES) {
            nodecg.log.error('index "%d" sent to "finishTime" is out of bounds', index);
            return;
        }

        var stopwatch = stopwatches.value[index];
        if (stopwatch.state === 'finished') return;

        rieussecs[index].pause();
        stopwatch.state = 'finished';
        recalcPlaces();

        return stopwatch;
    }

    function resetStopwatch(index) {
        if (index < 0 || index >= NUM_STOPWATCHES) {
            nodecg.log.error('index "%d" sent to "resetStopwatch" is out of bounds', index);
            return;
        }

        rieussecs[index].reset();
        stopwatches.value[index].milliseconds = 0;
        stopwatches.value[index].lastTick = null;
        stopwatches.value[index].state = 'stopped';
        recalcPlaces();

        return stopwatches.value[index];
    }

    function startFinishStopwatch(index) {
        if (index < 0 || index >= NUM_STOPWATCHES) {
            nodecg.log.error('index "%d" sent to "startFinishStopwatch" is out of bounds', index);
            return;
        }

        if (stopwatches.value[index].state === 'running') {
            finishStopwatch(index);
        } else {
            startStopwatch(index);
        }

        return stopwatches.value[index];
    }

    function setStopwatch (data) {
        var index = data.index;
        if (index < 0 || index >= NUM_STOPWATCHES) {
            nodecg.log.error('index "%d" sent to "setStopwatch" is out of bounds', index);
            return;
        }

        var targetRieussec = rieussecs[index];
        var targetStopwatch = stopwatches.value[index];

        // Pause all timers while we do our work.
        // Best way to ensure that all the tick cycles stay in sync.
        rieussecs.forEach(function(rieussec){
            rieussec._wasRunningBeforeEdit = rieussec._state === 'running';

            if (rieussec._wasRunningBeforeEdit) {
                rieussec.pause();
            }
        });

        targetRieussec.setMilliseconds(data.milliseconds, true);

        rieussecs.forEach(function(rieussec){
            if (rieussec._wasRunningBeforeEdit) {
                rieussec.start();
            }
        });

        return targetStopwatch;
    }

    function recalcPlaces() {
        var finishedStopwatches = stopwatches.value.filter(function(s) {
            s.place = 0;
            return s.state === 'finished';
        });

        finishedStopwatches.sort(function(a, b) {
            return a.milliseconds - b.milliseconds;
        });

        finishedStopwatches.forEach(function(s, index) {
            s.place = index + 1;
        });
    }

    var app = require('express')();

    if (nodecg.bundleConfig && nodecg.bundleConfig.enableRestApi) {
        nodecg.log.warn('"enableRestApi" is true, the stopwatch REST API will be active.');
        nodecg.log.warn('This API is COMPLETELY INSECURE. ONLY USE IT ON A SECURE LOCAL NETWORK.');

        app.get('/agdq16-layouts/stopwatches', function (req, res) {
            res.json(stopwatches.value);
        });

        app.put('/agdq16-layouts/stopwatch/:index/start', function (req, res) {
            var result = handleStartTimeRequest(req.params.index);
            if (result) {
                res.status(200).json(result);
            } else {
                res.status(422).send('Invalid stopwatch index "' + req.params.index + '"');
            }
        });

        app.put('/agdq16-layouts/stopwatch/:index/pause', function (req, res) {
            var result = handlePauseTimeRequest(req.params.index);
            if (result) {
                res.status(200).json(result);
            } else {
                res.status(422).send('Invalid stopwatch index "' + req.params.index + '"');
            }
        });

        app.put('/agdq16-layouts/stopwatch/:index/finish', function (req, res) {
            var result = handleFinishTimeRequest(req.params.index);
            if (result) {
                res.status(200).json(result);
            } else {
                res.status(422).send('Invalid stopwatch index "' + req.params.index + '"');
            }
        });

        app.put('/agdq16-layouts/stopwatch/:index/reset', function (req, res) {
            var result = handleResetTimeRequest(req.params.index);
            if (result) {
                res.status(200).json(result);
            } else {
                res.status(422).send('Invalid stopwatch index "' + req.params.index + '"');
            }
        });

        app.put('/agdq16-layouts/stopwatch/:index/startfinish', function (req, res) {
            var index = req.params.index;
            var result;

            if (index === 'all') {
                for (var i = 0; i < NUM_STOPWATCHES; i++) {
                    startFinishStopwatch(i);
                }
                result = stopwatches.value;
            } else {
                result = startFinishStopwatch(index);
            }

            if (result) {
                res.status(200).json(result);
            } else {
                res.status(422).send('Invalid stopwatch index "' + req.params.index + '"');
            }
        });
    } else {
        nodecg.log.info('"enableRestApi" is false, the stopwatch REST API will be unavailable');
    }

    app.get('/agdq16-layouts/stopwatches/control', nodecg.util.authCheck,function (req, res) {
        res.redirect('/graphics/agdq16-layouts/custom_controls/stopwatches/index.html');
    });

    nodecg.mount(app);
};

function msToTime(duration) {
    // This rounding is extremely important. It prevents all sorts of errors!
    duration = Math.floor(duration);

    var seconds = parseInt((duration/1000)%60),
        minutes = parseInt((duration/(1000*60))%60),
        hours = parseInt((duration/(1000*60*60))%24);

    hours = (hours < 10) ? hours : hours;
    minutes = (minutes < 10) ? '0' + minutes : minutes;
    seconds = (seconds < 10) ? '0' + seconds : seconds;

    return hours + ':' + minutes + ':' + seconds;
}
