/* global define */
define([
    'components/background',
    'components/speedrun'
], function(setBackground, setSpeedRunDimensions) {
    'use strict';

    var LAYOUT_NAME = 'ds_portrait';

    return function() {
        setBackground(LAYOUT_NAME);
        setSpeedRunDimensions(975, 0, 305, 151);
    };
});
