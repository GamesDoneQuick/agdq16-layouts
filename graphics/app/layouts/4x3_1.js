/* global define */
define([
    'components/background',
    'components/speedrun'
], function(setBackground, setSpeedRunDimensions) {
    'use strict';

    var LAYOUT_NAME = '4x3_1';

    return function() {
        setBackground(LAYOUT_NAME);
        setSpeedRunDimensions(882, 0, 398, 146, {
            nameY: 28,
            categoryY: 94,
            nameMaxHeight: 80
        });
    };
});
