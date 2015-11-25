/* global define */
define([
    'components/background',
    'components/speedrun'
], function(setBackground, setSpeedRunDimensions) {
    'use strict';

    var LAYOUT_NAME = 'ds';

    return function() {
        setBackground(LAYOUT_NAME);
        setSpeedRunDimensions(882, 291, 398, 127, {
            nameY: 18,
            categoryY: 80
        });
    };
});
