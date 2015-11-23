'use strict';

var BACKGROUND_ASPECT_RATIO = 1.397;

module.exports = function(nodecg) {
    nodecg.listenFor('requestBoxArt', function(width, cb) {
        var height = Math.round(width * BACKGROUND_ASPECT_RATIO);
        var url = 'https://static-cdn.jtvnw.net/ttv-boxart/Super%20Mario%2064-' + width + 'x' + height + '.jpg';
        cb({
            width: width,
            height: height,
            url: url
        });
    });
};
