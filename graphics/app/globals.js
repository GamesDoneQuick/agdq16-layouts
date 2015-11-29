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

    // This is really fragile, but whatever.
    var NUM_REPLICANTS = 4;
    var loadedReplicants = 0;

    currentBidsRep.on('declared', replicantDeclared);
    scheduleRep.on('declared', replicantDeclared);
    currentRunRep.on('declared', replicantDeclared);
    currentPrizesRep.on('declared', replicantDeclared);

    function replicantDeclared() {
        loadedReplicants++;
        if (loadedReplicants === NUM_REPLICANTS) {
            document.dispatchEvent(new CustomEvent('replicantsDeclared'));
            window.replicantsDeclared = true;
        }
    }

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
        },
        nextRun: {
            getter: function() {return currentRunRep.value.nextRun;}
        },
        currentRunRep: {
            value: currentRunRep
        }
    });
});
