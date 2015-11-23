/* global define */
define(function() {
    'use strict';

    var currentBidsRep = nodecg.Replicant('currentBids');
    var scheduleRep = nodecg.Replicant('schedule');
    var currentRunRep = nodecg.Replicant('currentRun');

    /* ----- */

    var currentPrizesRep =  nodecg.Replicant('currentPrizes');
    var currentGrandPrizes = [];
    var currentNormalPrizes = [];
    currentPrizesRep.on('change', function (oldVal, newVal) {
        currentGrandPrizes = newVal.filter(function (prize) {
            return prize.grand;
        });

        currentNormalPrizes = newVal.filter(function (prize) {
            return !prize.grand;
        });
    });

    /* ----- */

    return Object.create(Object.prototype, {
        currentBids: {
            getter: function() {return currentBidsRep.value;}
        },
        currentGrandPrizes: {
            getter: function() {return currentGrandPrizes;}
        },
        currentNormalPrizes: {
            getter: function() {return currentNormalPrizes;}
        },
        schedule: {
            getter: function() {return scheduleRep.value;}
        },
        currentRun: {
            getter: function() {return currentRunRep.value;}
        }
    });
});
