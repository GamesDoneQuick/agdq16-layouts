/* global define */
define([
    'components/background',
    'components/speedrun'
], function(setBackground, speedrun) {
    'use strict';

    var LAYOUT_NAME = 'break';

    return {
        attached: function() {
            setBackground(LAYOUT_NAME);
            speedrun.disable();
        },
        detached: function() {

        }
    };
});
