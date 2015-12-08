/* global define */
define([
    'components/background',
    'components/speedrun',
    'components/nameplates'
], function (setBackground, speedrun, nameplates) {
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

            nameplates.configure({},[{
                x: 882,
                y: 418,
                width: 398,
                height: 54,
                nameFontSize: 28,
                estimateFontSize: 18,
                timeFontSize: 48
            }]);
        }
    };
});
