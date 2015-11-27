/* global define, OBSRemote */
define([
    'layout'
], function (layout) {
    'use strict';

    var obs = new OBSRemote();

    obs.onConnectionOpened = function () {
        console.log('OBS | Connected.');
        _handleSceneSwitch();
    };

    obs.onConnectionClosed = function () {
        console.log('OBS | Connection closed.');
    };

    obs.onConnectionFailed = function () {
        console.log('OBS | Failed to connect.');
    };

    obs.onAuthenticationFailed = function (remainingAttempts) {
        console.log('OBS | Authentication failed, %s attempts remaining.', remainingAttempts);
    };

    obs.onSceneSwitched = _handleSceneSwitch;
    obs.onSourceChanged = _handleSceneSwitch;

    function _handleSceneSwitch() {
        obs.getCurrentScene(function (scene) {
            console.log('OBS | Switched to scene "%s".', scene.name);

            scene.sources.some(function(source) {
                if (source.name.indexOf('Layout ') === 0) {
                    layout(source.name.split(' ')[1]);
                }
            });
        });
    }

    if (nodecg.bundleConfig && nodecg.bundleConfig.obs) {
        obs.connect(nodecg.bundleConfig.obs.host, nodecg.bundleConfig.obs.password);
    } else {
        obs.connect();
    }


    return obs;
});

