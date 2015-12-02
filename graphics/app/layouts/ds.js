/* global define */
define([
    'components/background',
    'components/speedrun'
], function(setBackground, speedrun) {
    'use strict';

    var LAYOUT_NAME = 'ds';

    return {
        attached: function() {
            setBackground(LAYOUT_NAME);
            speedrun.configure(882, 291, 398, 127, {
                nameY: 18,
                categoryY: 80,
                nameMaxHeight: 80
            });
        }
    };
});
