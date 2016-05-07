'use strict';

var LastFmNode = require('lastfm').LastFmNode;

module.exports = function(nodecg) {
    if (!nodecg.bundleConfig) {
        nodecg.log.error('cfg/agdq16-layouts.json was not found. "Now playing" graphic will be disabled.');
        return;
    } else if (typeof nodecg.bundleConfig.lastfm === 'undefined') {
        nodecg.log.error('"lastfm" is not defined in cfg/agdq16-layouts.json! ' +
            '"Now playing" graphic will be disabled.');
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

        // Hard-coded 12 second duration
        pulseTimeout = setTimeout(function() {
            pulsing.value = false;
        }, 12 * 1000);
    }

    trackStream.on('nowPlaying', function(track) {
        var newNp = {
            artist: track.artist['#text'],
            song: track.name,
            album: track.album['#text'] || track.artist['#text'],
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
