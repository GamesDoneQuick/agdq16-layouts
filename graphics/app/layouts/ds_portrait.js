/* global define */
define([
    'components/background',
    'components/speedrun'
], function(setBackground, speedrun) {
    'use strict';

    var LAYOUT_NAME = 'ds_portrait';

    return {
        attached: function() {
            setBackground(LAYOUT_NAME);
            speedrun.configure(975, 0, 305, 151, {
                nameY: 29,
                categoryY: 89,
                nameMaxHeight: 70
            });
        }
    };
});
