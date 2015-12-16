/* global define, OBSRemote */
define([
    'debug',
    'layout',
    'debounce'
], function (debug, layout, debounce) {
    'use strict';

    var obs = new OBSRemote();

    var retryConnection = debounce(connect, 5000);

    var _handleSceneSwitch = debounce(function () {
        obs.getCurrentScene(function (scene) {
            scene.sources.some(function(source) {
                if (source.name.indexOf('Layout ') === 0) {
                    layout.changeTo(source.name.split(' ')[1]);
                }
            });
        });
    }, 10);

    obs.onConnectionOpened = function () {
        console.log('[OBS] Connected.');
        _handleSceneSwitch();
    };

    obs.onConnectionClosed = function () {
        console.log('[OBS] Connection closed.');
        retryConnection();
    };

    obs.onConnectionFailed = function () {
        console.log('[OBS] Failed to connect.');
        retryConnection();
    };

    obs.onAuthenticationFailed = function (remainingAttempts) {
        console.log('[OBS] Authentication failed, %s attempts remaining.', remainingAttempts);
    };

    obs.onSceneSwitched = function(sceneName) {
        debug.log('[OBS] Switched to scene "%s".', sceneName);
        _handleSceneSwitch();
    };
    obs.onSourceChanged = _handleSceneSwitch;
    obs.onSourceAddedOrRemoved = _handleSceneSwitch;

    function connect() {
        if (nodecg.bundleConfig && nodecg.bundleConfig.obs) {
            obs.connect(nodecg.bundleConfig.obs.host, nodecg.bundleConfig.obs.password);
        } else {
            obs.connect();
        }
    }

    connect();

    return obs;
});

