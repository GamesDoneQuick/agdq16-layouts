/* global define */
define([
    'components/background',
    'components/speedrun'
], function(setBackground, setSpeedRunDimensions) {
    'use strict';

    var LAYOUT_NAME = '3ds';

    return function() {
        setBackground(LAYOUT_NAME);
        setSpeedRunDimensions(0, 567, 335, 98);
    };
});
