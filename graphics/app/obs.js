/* global define, OBSRemote */
define(function () {
    'use strict';

    var obs = new OBSRemote();

    if (nodecg.bundleConfig && nodecg.bundleConfig.obs) {
        obs.connect(nodecg.bundleConfig.obs.host, nodecg.bundleConfig.obs.password);
    } else {
        obs.connect('localhost');
    }

    obs.onConnectionOpened(function() {
        console.log('OBS | Connected.');
    });

    obs.onConnectionClosed(function() {
        console.log('OBS | Connection closed.');
    });

    obs.onConnectionFailed(function() {
        console.log('OBS | Failed to connect.');
    });

    obs.onSceneSwitched(function(sceneName) {
        console.log('OBS | Switched to scene "%s".', sceneName);
    });

    return obs;
});

