/* global define */
define([
    'components/background',
    'components/speedrun',
    'components/nameplates'
], function (setBackground, speedrun, nameplates) {
    'use strict';

    var LAYOUT_NAME = '4x3_2';

    return {
        attached: function() {
            setBackground(LAYOUT_NAME);

            speedrun.configure(0, 536, 430, 130, {
                nameY: 15,
                categoryY: 81,
                nameMaxHeight: 80
            });

            nameplates.configure({
                nameFontSize: 28,
                estimateFontSize: 18,
                timeFontSize: 48,
                width: 430,
                height: 52,
                y: 481,
                bottomBorder: true
            },[
                {
                    x: 0,
                    alignment: 'right'
                },{
                    x: 850,
                    alignment: 'left'
                }
            ]);
        }
    };
});
