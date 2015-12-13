'use strict';

var singleInstance = require('../../../lib/graphics/single_instance');

module.exports = function(nodecg) {
    var adState = nodecg.Replicant('adState', {defaultValue: 'stopped', persistent: false});
    var layoutState = nodecg.Replicant('layoutState', {
        defaultValue: {
            currentLayout: null,
            page: 'closed'
        },
        persistent: false
    });

    singleInstance.on('graphicAvailable', function(url) {
        if (url === '/graphics/agdq16-layouts/index.html') {
            layoutState.value.page = 'closed';
            layoutState.value.currentLayout = null;
            adState.value = 'stopped';
        }
    });
};
