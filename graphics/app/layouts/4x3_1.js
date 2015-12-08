/* global define */
define([
    'components/background',
    'components/speedrun',
    'components/nameplates'
], function (setBackground, speedrun, nameplates) {
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

            nameplates.configure({},[{
                x: 882,
                y: 383,
                width: 398,
                height: 52,
                nameFontSize: 24,
                estimateFontSize: 18,
                timeFontSize: 48,
                bottomBorder: true
            }]);
        }
    };
});
