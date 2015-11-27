/* global define */
define([
    'components/background',
    'components/speedrun'
], function(setBackground, setSpeedRunDimensions) {
    'use strict';

    var LAYOUT_NAME = '4x3_2';

    return function() {
        setBackground(LAYOUT_NAME);
        setSpeedRunDimensions(0, 536, 430, 130, {
            nameY: 15,
            categoryY: 81,
            nameMaxHeight: 80
        });
    };
});
