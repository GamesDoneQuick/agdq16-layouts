/* global define */
define([
    'components/background',
    'components/speedrun'
], function(setBackground, setSpeedRunDimensions) {
    'use strict';

    var LAYOUT_NAME = '3x2_2';

    return function() {
        setBackground(LAYOUT_NAME);
        setSpeedRunDimensions(0, 481 , 430, 184, {
            nameY: 35,
            categoryY: 124
        });
    };
});
