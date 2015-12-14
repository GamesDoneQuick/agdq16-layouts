'use strict';

/*
 * NOTE: It is absolutely critical that the `args` param of any udpPort.send command not be null or undefined.
 * Doing so causes the osc lib to actually encode it as a null argument (,N). Instead, use an empty array ([]).
 */

var X32_UDP_PORT = 10023;
var FADE_THRESHOLD = 0.15;
var DEFAULT_CHANNEL_OBJ = {
    sd: {muted: true, fadedBelowThreshold: true},
    hd: {muted: true, fadedBelowThreshold: true}
};

var clone = require('clone');
var osc = require('osc');

module.exports = function(nodecg) {
    if (!nodecg.bundleConfig) {
        throw new Error('cfg/agdq16-layouts.json does not exist. This config file is mandatory.');
    } else if (!Array.isArray(nodecg.bundleConfig.gameAudioChannels)) {
        throw new Error('cfg/agdq16-layouts.json must have the property "gameAudioChannels" and it must be an array.');
    } else if (typeof nodecg.bundleConfig.x32Address !== 'string') {
        throw new Error('cfg/agdq16-layouts.json must have the property "x32Address" and it must be a string.');
    }

    var gameAudioChannels = nodecg.Replicant('gameAudioChannels', {
        defaultValue: [
            clone(DEFAULT_CHANNEL_OBJ),
            clone(DEFAULT_CHANNEL_OBJ),
            clone(DEFAULT_CHANNEL_OBJ),
            clone(DEFAULT_CHANNEL_OBJ)
        ],
        persistent: false
    });

    var channelNumberToReplicantObject = {};
    nodecg.bundleConfig.gameAudioChannels.forEach(function(item, index) {
        if (typeof item.sd === 'number') {
            channelNumberToReplicantObject[item.sd] = gameAudioChannels.value[index].sd;
        }

        if (typeof item.hd === 'number') {
            channelNumberToReplicantObject[item.hd] = gameAudioChannels.value[index].hd;
        }
    });

    var udpPort = new osc.UDPPort({
        localAddress: '0.0.0.0',
        localPort: 52361,
        remoteAddress: nodecg.bundleConfig.x32Address,
        remotePort: X32_UDP_PORT,
        metadata: true
    });

    udpPort.on('raw', function (buf) {
        var str = buf.toString('ascii');
        var valueBytes, replicantObject;
        var channelNumber = 0;
        var i = 0;
        var valueArray = [];

        if (str.indexOf('/chMutes') === 0) {
            // For this particular message, we know that the values start at byte 21 and stop 3 bytes from the end.
            valueBytes = buf.slice(21, -3);

            for (i = 0; i < valueBytes.length; i+=4) {
                var muted = !Boolean(valueBytes.readFloatBE(i));
                valueArray.push(muted);

                replicantObject = channelNumberToReplicantObject[String(channelNumber+1)];
                if (replicantObject) {
                    replicantObject.muted = muted;
                }

                channelNumber++;
            }
        }

        else if (str.indexOf('/chFaders') === 0) {
            // For this particular message, we know that the values start at byte 24
            valueBytes = buf.slice(24);

            for (i = 0; i < valueBytes.length; i+=4) {
                var fadedBelowThreshold = valueBytes.readFloatLE(i) < FADE_THRESHOLD;
                valueArray.push(fadedBelowThreshold);

                replicantObject = channelNumberToReplicantObject[String(channelNumber+1)];
                if (replicantObject) {
                    replicantObject.fadedBelowThreshold = fadedBelowThreshold;
                }

                channelNumber++;
            }
        }
    });

    udpPort.on('error', function (error) {
        nodecg.log.warn('[osc] Error:', error.stack);
    });

    udpPort.on('open', function () {
        nodecg.log.info('[osc] Connected to Behringer X32');
    });

    udpPort.on('close', function () {
        nodecg.log.warn('[osc] Disconnected from Behringer X32');
    });

    // Open the socket.
    udpPort.open();

    renewSubscriptions();
    setInterval(renewSubscriptions, 10000);

    function renewSubscriptions() {
        udpPort.send({
            address: '/batchsubscribe',
            args: [
                // This first argument seems to define local endpoint that the X32 will send this subscription data to.
                {type: 's', value: '/chMutes'},
                {type: 's', value: '/mix/on'},
                {type: 'i', value: 0},
                {type: 'i', value: 63},
                {type: 'i', value: 10}
            ]
        });

        udpPort.send({
            address: '/batchsubscribe',
            args: [
                // This first argument seems to define local endpoint that the X32 will send this subscription data to.
                {type: 's', value: '/chFaders'},
                {type: 's', value: '/mix/fader'},
                {type: 'i', value: 0},
                {type: 'i', value: 63},
                {type: 'i', value: 10}
            ]
        });
    }
};
