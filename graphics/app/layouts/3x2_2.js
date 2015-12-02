/* global define */
define([
    'components/background',
    'components/speedrun'
], function(setBackground, speedrun) {
    'use strict';

    var LAYOUT_NAME = '3x2_2';

    return {
        attached: function() {
            setBackground(LAYOUT_NAME);
            speedrun.configure(0, 481 , 430, 184, {
                nameY: 35,
                categoryY: 124,
                nameMaxHeight: 90
            });
        }
    };
});
