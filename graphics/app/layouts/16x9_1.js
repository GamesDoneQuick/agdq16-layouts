/* global define */
define([
    'components/background',
    'components/speedrun',
    'components/nameplates'
], function (setBackground, speedrun, nameplates) {
    'use strict';

    var LAYOUT_NAME = '16x9_1';

    return {
        attached: function() {
            setBackground(LAYOUT_NAME);

            speedrun.configure(0, 543, 469, 122, {
                nameY: 10,
                categoryY: 74,
                nameMaxHeight: 70
            });

            nameplates.configure({},[{
                x: 469,
                y: 572,
                width: 498,
                height: 65,
                nameFontSize: 35,
                estimateFontSize: 23,
                timeFontSize: 61
            }]);
        }
    };
});
