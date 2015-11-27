/* jshint -W106 */
'use strict';

var BIDS_URL = 'https://gamesdonequick.com/tracker/search/?type=allbids&event=17';
var CURRENT_BIDS_URL = 'https://gamesdonequick.com/tracker/search/?type=allbids&feed=current&event=17';
var POLL_INTERVAL = 1 * 60 * 1000;

var format = require('util').format;
var Q = require('q');
var request = require('request');
var equal = require('deep-equal');
var numeral = require('numeral');

module.exports = function (nodecg) {
    var currentBids = nodecg.Replicant('currentBids', {defaultValue: []});
    var allBids = nodecg.Replicant('allBids', {defaultValue: []});

    // Get initial data
    update();

    // Get latest bid data every POLL_INTERVAL milliseconds
    nodecg.log.info('Polling bids every %d seconds...', POLL_INTERVAL / 1000);
    var updateInterval = setInterval(update.bind(this), POLL_INTERVAL);

    // Dashboard can invoke manual updates
    nodecg.listenFor('updateBids', function(data, cb) {
        nodecg.log.info('Manual bid update button pressed, invoking update...');
        clearInterval(updateInterval);
        updateInterval = setInterval(update.bind(this), POLL_INTERVAL);
        update()
            .spread(function (updatedCurrent, updatedAll) {
                var updatedEither = updatedCurrent || updatedAll;
                if (updatedEither) {
                    nodecg.log.info('Bids successfully updated');
                } else {
                    nodecg.log.info('Bids unchanged, not updated');
                }

                cb(null, updatedEither);
            }, function (error) {
                cb(error);
            });
    });

    function update() {
        var currentPromise = Q.defer();
        request(CURRENT_BIDS_URL, function(err, res, body) {
            handleResponse(err, res, body, currentPromise, {
                label: 'current bids',
                replicant: currentBids
            });
        });

        var allPromise = Q.defer();
        request(BIDS_URL, function(err, res, body) {
            handleResponse(err, res, body, allPromise, {
                label: 'all bids',
                replicant: allBids
            });
        });

        return Q.all([
            currentPromise.promise,
            allPromise.promise
        ]);
    }

    function handleResponse(error, response, body, deferred, opts) {
        if (!error && response.statusCode === 200) {
            var bids = JSON.parse(body);

            // The response from the tracker is flat. This is okay for donation incentives, but it requires
            // us to do some extra work to figure out what the options are for donation wars that have multiple
            // options.
            var parentBidsById = {};
            var childBids = [];
            bids.forEach(function(bid) {
                // If this bid is an option for a donation war, add it to childBids array.
                if (bid.fields.parent) {
                    childBids.push(bid);
                }

                // Else, add it to the parentBidsById object.
                else {
                    // Format the bid to clean up unneeded cruft.
                    var formattedParentBid = {
                        id: bid.pk,
                        name: bid.fields.name,
                        description: bid.fields.shortdescription || 'No shortdescription for bid #' + bid.pk,
                        total: numeral(bid.fields.total).format('$0,0[.]00'),
                        state: bid.fields.state,
                        speedrun: bid.fields.public.split(' -- ')[0].substring(6),
                        type: 'bid'
                    };

                    // If this parent bid is not a target, that means it is a donation war that has options.
                    // So, we should add an options property that is an empty array,
                    // which we will fill in the next step.
                    // Else, add the "target" field to the formattedParentBid.
                    if (bid.fields.istarget === false) {
                        formattedParentBid.options = [];
                    } else {
                        formattedParentBid.goal = numeral(bid.fields.goal).format('$0,0[.]00');
                        formattedParentBid.goalMet = bid.fields.total >= bid.fields.goal;
                    }

                    parentBidsById[bid.pk] = formattedParentBid;
                }
            });

            // Now that we have a big array of all child bids (i.e., donation war options), we need
            // to assign them to their parents in the parentBidsById object.
            childBids.forEach(function(bid) {
                var formattedChildBid = {
                    id: bid.pk,
                    parent: bid.fields.parent,
                    name: bid.fields.name,
                    description: bid.fields.shortdescription,
                    total: numeral(bid.fields.total).format('$0,0[.]00')
                };

                var parent = parentBidsById[bid.fields.parent];
                if (parent) {
                    parentBidsById[bid.fields.parent].options.push(formattedChildBid);
                } else {
                    nodecg.log.error('Child bid #%d\'s parent (bid #%s) could not be found.' +
                        ' This child bid will be discarded!', bid.pk, bid.fields.parent);
                }
            });

            // Ah, but now we have to sort all these child bids by how much they have raised so far!
            // While we're at it, map all the parent bids back onto an array.
            var bidsArray = [];
            for (var id in parentBidsById) {
                if (!parentBidsById.hasOwnProperty(id)) continue;
                var bid = parentBidsById[id];
                bidsArray.push(bid);
                if (!bid.options) continue;
                bid.options = bid.options.sort(function (a, b) {
                    var aTotal = numeral().unformat(a.total);
                    var bTotal = numeral().unformat(b.total);
                    if (aTotal > bTotal) {
                        return -1;
                    }
                    if (aTotal < bTotal) {
                        return 1;
                    }
                    // a must be equal to b
                    return 0;
                });
            }

            // After all that, deep-compare our newly-calculated parentBidsById object against the existing value.
            // Only assign the replicant if it's actually different.
            if (equal(bidsArray, opts.replicant.value)) {
                deferred.resolve(false);
            } else {
                opts.replicant.value = bidsArray;
                deferred.resolve(true);
            }
        } else {
            var msg = format('Could not get %s, unknown error', opts.label);
            if (error) msg = format('Could not get %s:', opts.label, error.message);
            else if (response) msg = format('Could not get %s, response code %d', opts.label, response.statusCode);
            nodecg.log.error(msg);
            deferred.reject(msg);
        }
    }
};
