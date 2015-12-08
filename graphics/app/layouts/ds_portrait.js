/* global define */
define([
    'components/background',
    'components/speedrun',
    'components/nameplates'
], function (setBackground, speedrun, nameplates) {
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

            nameplates.configure({},[{
                x: 975,
                y: 151,
                width: 305,
                height: 54,
                nameFontSize: 24,
                estimateFontSize: 18,
                timeFontSize: 36
            }]);
        }
    };
});
