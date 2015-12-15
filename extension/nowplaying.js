'use strict';

var LastFmNode = require('lastfm').LastFmNode;

module.exports = function(nodecg) {
    if (!nodecg.bundleConfig) {
        nodecg.log.error('cfg/agdq16-layouts.json was not found. ' +
            'This file is where the Last.fm API key and secret are set. ' +
            'Without those, the "now playing" graphic cannot function.');
        return;
    }
    else if (typeof nodecg.bundleConfig.lastfm === 'undefined') {
        nodecg.log.error('"lastfm" is not defined in cfg/agdq16-layouts.json! ' +
            'This object contains other properties that are required for the "now playing" graphic to function.');
        return;
    }
    else if (typeof nodecg.bundleConfig.lastfm.apiKey === 'undefined') {
        nodecg.log.error('lastfm.apiKey is not defined in cfg/agdq16-layouts.json! ' +
            'This key (obtained from your Last.fm developer account) ' +
            ' is required for the "now playing" graphic to function.');
        return;
    }
    else if (typeof nodecg.bundleConfig.lastfm.secret === 'undefined') {
        nodecg.log.error('lastfm.secret is not defined in cfg/agdq16-layouts.json! ' +
            'This secret (obtained from your Last.fm developer account) ' +
            'is required for the "now playing" graphic to function.');
        return;
    }
    else if (typeof nodecg.bundleConfig.lastfm.targetAccount === 'undefined') {
        nodecg.log.error('lastfm.targetAccount is not defined in cfg/agdq16-layouts.json! ' +
            'This is the Last.fm username that you wish to pull "now playing" song data from.');
        return;
    }

    /* jshint -W106 */
    var lastfm = new LastFmNode({
        api_key: nodecg.bundleConfig.lastfm.apiKey,
        secret: nodecg.bundleConfig.lastfm.secret
    });
    var trackStream  = lastfm.stream(nodecg.bundleConfig.lastfm.targetAccount);
    /* jshint +W106 */

    var pulseTimeout;
    var pulsing = nodecg.Replicant('nowPlayingPulsing', {defaultValue: false, persistent: false});
    var nowPlaying = nodecg.Replicant('nowPlaying', {defaultValue: {}, persistent: false});

    nodecg.listenFor('pulseNowPlaying', pulse);
    function pulse() {
        // Don't stack pulses
        if (pulsing.value) return;
        pulsing.value = true;

        // Hard-coded 15 second duration
        pulseTimeout = setTimeout(function() {
            pulsing.value = false;
        }, 12 * 1000);
    }

    trackStream.on('nowPlaying', function(track) {
        var newNp = {
            artist: track.artist['#text'],
            song: track.name,
            album: track.album['#text'],
            cover: track.image.pop()['#text'],
            artistSong: track.artist['#text'] + ' - ' + track.name
        };

        // As of 2015-11-22, Last.fm seems to sometimes send duplicate "nowPlaying" events.
        // This filters them out.
        if (typeof nowPlaying.value.artistSong === 'string') {
            if (newNp.artistSong.toLowerCase() === nowPlaying.value.artistSong.toLowerCase()) {
                return;
            }
        }

        nowPlaying.value = newNp;

        // If the graphic is already showing, end it prematurely and show the new song
        if (pulsing.value) {
            clearTimeout(pulseTimeout);
            pulsing.value = false;
        }

        // Show the graphic
        pulse();
    });

    trackStream.on('error', function() {
        // Just ignore it, this lib generates tons of errors.
    });

    trackStream.start();
};
