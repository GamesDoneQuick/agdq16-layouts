/* global define */
define([
    'components/background',
    'components/speedrun',
    'components/nameplates'
], function (setBackground, speedrun, nameplates) {
    'use strict';

    var LAYOUT_NAME = '3x2_1';

    return {
        attached: function() {
            setBackground(LAYOUT_NAME);

            speedrun.configure(950, 0, 330, 146, {
                scale: 0.834,
                nameY: 26,
                nameMaxHeight: 80,
                categoryY: 97
            });

            nameplates.configure({},[{
                x: 950,
                y: 341,
                width: 330,
                height: 45,
                nameFontSize: 23,
                estimateFontSize: 15,
                timeFontSize: 40,
                bottomBorder: true
            }]);
        }
    };
});
