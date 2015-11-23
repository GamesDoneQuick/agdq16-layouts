/* global define, TimelineLite */
define(function() {
    'use strict';

    /**
     * Creates a new Omnibar.
     * @constructor
     * @class Omnibar
     * @returns {Object}
     */
    function Omnibar() {
        this.tl = new TimelineLite({autoRemoveChildren: true});
        this.displayDuration = 10;
        this.lastShownGrandPrizeIdx = -1;

        nodecg.Replicant('total').on('change', function(oldVal, newVal) {

        });

        nodecg.listenFor('barDemand', function(data) {
            switch (data.type) {
                case 'bid':
                    this.showBid(data, true);
                    break;
                case 'prize':
                    this.showPrize(data, true);
                    break;
                default:
                    throw new Error('Invalid barDemand type: ' + data.type);
            }
        }.bind(this));

        nodecg.listenFor('barCurrentBids', function() {
            this.showBids(true);
        }.bind(this));

        nodecg.listenFor('barCurrentPrizes', function() {
            this.showPrizes(true);
        }.bind(this));

        nodecg.listenFor('barUpNext', function() {
            this.showNext(true);
        }.bind(this));

        nodecg.listenFor('barCTA', function() {
            this.showCTA(true);
        }.bind(this));

        nodecg.listenFor('barGDQMonitor', function(message) {
            this.showGDQMonitor(message);
        }.bind(this));

        // Bids are the first thing we show, so we use this to start our loop
        this.showCTA();
    }
});
