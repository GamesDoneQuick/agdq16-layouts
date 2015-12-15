'use strict';

module.exports = function(nodecg) {
    var lowerthirdShowing = nodecg.Replicant('interviewLowerthirdShowing', {defaultValue: false, persistent: false});
    var lowerthirdPulsing = nodecg.Replicant('interviewLowerthirdPulsing', {defaultValue: false, persistent: false});
    nodecg.Replicant('interviewNames', {defaultValue: [], persistent: false});

    nodecg.listenFor('pulseInterviewLowerthird', function pulse(duration) {
        // Don't stack pulses
        if (lowerthirdPulsing.value) return;

        lowerthirdShowing.value = true;
        lowerthirdPulsing.value = true;

        // End pulse after "duration" seconds
        setTimeout(function() {
            lowerthirdShowing.value = false;
            lowerthirdPulsing.value = false;
        }, duration * 1000);
    });
};
