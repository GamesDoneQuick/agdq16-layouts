/* global define */
define(function() {
    'use strict';

    var currentBidsRep = nodecg.Replicant('currentBids');
    var scheduleRep = nodecg.Replicant('schedule');
    var currentRunRep = nodecg.Replicant('currentRun');
    var totalRep = nodecg.Replicant('total');
    var displayDurationRep = nodecg.Replicant('displayDuration');
    var stopwatchesRep = nodecg.Replicant('stopwatches');
    var gameAudioChannelsRep = nodecg.Replicant('gameAudioChannels');

    /* ----- */

    var currentPrizesRep = nodecg.Replicant('currentPrizes');
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

    // This is really fragile, but whatever.
    var NUM_REPLICANTS = 8;
    var loadedReplicants = 0;

    currentBidsRep.on('declared', replicantDeclared);
    scheduleRep.on('declared', replicantDeclared);
    currentRunRep.on('declared', replicantDeclared);
    currentPrizesRep.on('declared', replicantDeclared);
    totalRep.on('declared', replicantDeclared);
    displayDurationRep.on('declared', replicantDeclared);
    stopwatchesRep.on('declared', replicantDeclared);
    gameAudioChannelsRep.on('declared', replicantDeclared);

    function replicantDeclared() {
        loadedReplicants++;
        if (loadedReplicants === NUM_REPLICANTS) {
            document.dispatchEvent(new CustomEvent('replicantsDeclared'));
            window.replicantsDeclared = true;
        }
    }

    /* ----- */

    return Object.create(Object.prototype, {
        // Bids
        currentBids: {
            get: function() {return currentBidsRep.value;}
        },

        // Prizes
        currentPrizesRep: {
            value: currentPrizesRep
        },
        currentGrandPrizes: {
            get: function() {return currentGrandPrizes;}
        },
        currentNormalPrizes: {
            get: function() {return currentNormalPrizes;}
        },

        // Schedule
        schedule: {
            get: function() {return scheduleRep.value;}
        },
        currentRun: {
            get: function() {return currentRunRep.value;}
        },
        nextRun: {
            get: function() {return currentRunRep.value.nextRun;}
        },
        currentRunRep: {
            value: currentRunRep
        },

        // Other
        totalRep: {
            value: totalRep
        },
        displayDuration: {
            get: function() {return displayDurationRep.value;}
        },
        stopwatchesRep: {
            value: stopwatchesRep
        },
        gameAudioChannelsRep: {
            value: gameAudioChannelsRep
        }
    });
});
