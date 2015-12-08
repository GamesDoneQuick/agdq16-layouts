/* global define */
define([
    'components/background',
    'components/speedrun',
    'components/nameplates'
], function (setBackground, speedrun, nameplates) {
    'use strict';

    var LAYOUT_NAME = '3ds';

    return {
        attached: function() {
            setBackground(LAYOUT_NAME);

            speedrun.configure(0, 567, 335, 98, {
                scale: 0.834,
                nameY: 10,
                nameMaxHeight: 50,
                categoryY: 64
            });

            nameplates.configure({},[{
                x: 335,
                y: 567,
                width: 592,
                height: 98,
                nameFontSize: 50,
                estimateFontSize: 32,
                timeFontSize: 72,
                bottomBorder: true
            }]);
        }
    };
});
