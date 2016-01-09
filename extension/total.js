'use strict';

var DONATION_STATS_URL = 'https://gamesdonequick.com/tracker/17?json';
var POLL_INTERVAL = 60 * 1000;

var util = require('util');
var Q = require('q');
var request = require('request');
var numeral = require('numeral');

var updateInterval;

module.exports = function (nodecg) {
    var total = nodecg.Replicant('total', {
        defaultValue: {
            raw: 0,
            formatted: '$0'
        }
    });

    var autoUpdateTotal = nodecg.Replicant('autoUpdateTotal', {defaultValue: true});
    autoUpdateTotal.on('change', function(oldVal, newVal) {
        if (newVal) {
            nodecg.log.info('Automatic updating of donation total enabled');
            updateTotal(true);
        } else {
            nodecg.log.warn('Automatic updating of donation total DISABLED');
            clearInterval(updateInterval);
        }
    });

    nodecg.listenFor('setTotal', function(raw) {
        total.value = {
            raw: parseFloat(raw),
            formatted: numeral(raw).format('$0,0')
        };
    });

    // Get initial data
    update();

    if (autoUpdateTotal.value) {
        // Get latest prize data every POLL_INTERVAL milliseconds
        nodecg.log.info('Polling donation total every %d seconds...', POLL_INTERVAL / 1000);
        clearInterval(updateInterval);
        updateInterval = setInterval(update, POLL_INTERVAL);
    } else {
        nodecg.log.info('Automatic update of total is disabled, will not poll until enabled');
    }

    // Dashboard can invoke manual updates
    nodecg.listenFor('updateTotal', updateTotal);

    function updateTotal(silent, cb) {
        if (!silent) nodecg.log.info('Manual donation total update button pressed, invoking update...');
        clearInterval(updateInterval);
        updateInterval = setInterval(update, POLL_INTERVAL);
        update()
            .then(function (updated) {
                if (updated) {
                    nodecg.log.info('Donation total successfully updated');
                } else {
                    nodecg.log.info('Donation total unchanged, not updated');
                }

                cb(null, updated);
            }, function (error) {
                cb(error);
            });
    }

    function update() {
        var deferred = Q.defer();
        request(DONATION_STATS_URL, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                var stats;

                try {
                    stats = JSON.parse(body);
                } catch(e) {
                    nodecg.log.error('Could not parse total, response not valid JSON:\n\t', body);
                    return;
                }

                var freshTotal = parseFloat(stats.agg.amount || 0);

                if (freshTotal !== total.value.raw) {
                    total.value = {
                        raw: freshTotal,
                        formatted: numeral(freshTotal).format('$0,0')
                    };
                    deferred.resolve(true);
                } else {
                    deferred.resolve(false);
                }
            } else {
                var msg = 'Could not get donation total, unknown error';
                if (error) msg = util.format('Could not get donation total:', error.message);
                else if (response) msg = util.format('Could not get donation total, response code %d',
                    response.statusCode);
                nodecg.log.error(msg);
                deferred.reject(msg);
            }
        });
        return deferred.promise;
    }
};
