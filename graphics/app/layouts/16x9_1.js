/* global define */
define([
    'components/background',
    'components/speedrun'
], function(setBackground, setSpeedRunDimensions) {
    'use strict';

    var LAYOUT_NAME = '16x9_1';

    return function() {
        setBackground(LAYOUT_NAME);
        setSpeedRunDimensions(0, 543, 469, 122);
    };
});
