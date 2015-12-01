'use strict';

var singleInstance = require('../../../lib/graphics/single_instance');

module.exports = function(nodecg) {
    var layoutState = nodecg.Replicant('layoutState', {defaultValue: 'closed', persistent: false});
    var adState = nodecg.Replicant('adState', {defaultValue: 'stopped', persistent: false});

    singleInstance.on('graphicAvailable', function(url) {
        if (url === '/graphics/agdq16-layouts/index.html') {
            layoutState.value = 'closed';
            adState.value = 'stopped';
        }
    });
};
