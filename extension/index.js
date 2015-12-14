'use strict';

module.exports = function(nodecg) {
    // Initialize this here because there's kinda nowhere better to do it.
    nodecg.Replicant('displayDuration', {defaultValue: 10});

    try {
        require('./schedule')(nodecg);
    } catch (e) {
        nodecg.log.error('Failed to load "schedule" lib:', e.stack);
        process.exit(1);
    }

    try {
        require('./prizes')(nodecg);
    } catch (e) {
        nodecg.log.error('Failed to load "prizes" lib:', e.stack);
        process.exit(1);
    }

    try {
        require('./bids')(nodecg);
    } catch (e) {
        nodecg.log.error('Failed to load "bids" lib:', e.stack);
        process.exit(1);
    }

    try {
        require('./total')(nodecg);
    } catch (e) {
        nodecg.log.error('Failed to load "total" lib:', e.stack);
        process.exit(1);
    }

    try {
        require('./stopwatches')(nodecg);
    } catch (e) {
        nodecg.log.error('Failed to load "stopwatches" lib:', e.stack);
        process.exit(1);
    }

    try {
        require('./sponsors')(nodecg);
    } catch (e) {
        nodecg.log.error('Failed to load "sponsors" lib:', e.stack);
        process.exit(1);
    }

    try {
        require('./advertisements')(nodecg);
    } catch (e) {
        nodecg.log.error('Failed to load "advertisements" lib:', e.stack);
        process.exit(1);
    }

    try {
        require('./twitter')(nodecg);
    } catch (e) {
        nodecg.log.error('Failed to load "twitter" lib:', e.stack);
        process.exit(1);
    }

    try {
        require('./osc')(nodecg);
    } catch (e) {
        nodecg.log.error('Failed to load "osc" lib:', e.stack);
        process.exit(1);
    }

    try {
        require('./state')(nodecg);
    } catch (e) {
        nodecg.log.error('Failed to load "state" lib:', e.stack);
        process.exit(1);
    }
};
