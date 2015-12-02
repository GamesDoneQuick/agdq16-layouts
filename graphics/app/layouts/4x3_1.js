/* global define */
define([
    'components/background',
    'components/speedrun'
], function(setBackground, speedrun) {
    'use strict';

    var LAYOUT_NAME = '4x3_1';

    return {
        attached: function() {
            setBackground(LAYOUT_NAME);
            speedrun.configure(882, 0, 398, 146, {
                nameY: 28,
                categoryY: 94,
                nameMaxHeight: 80
            });
        }
    };
});
