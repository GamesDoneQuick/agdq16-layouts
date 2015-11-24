/* global define */
define([
    'preloader'
], function(preloader) {
    'use strict';

    var containerEl = document.getElementById('container');
    var lastBg;

    return function(bgName) {
        console.log('setBackground |', bgName);

        // Remove the last background, if any.
        if (lastBg) {
            lastBg.remove();
        }

        var newBg = preloader.getResult('bg-' + bgName);
        newBg.id = 'background';
        containerEl.appendChild(newBg);
        lastBg = newBg;
    };
});
