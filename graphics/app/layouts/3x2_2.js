/* global define */
define([
    'components/background',
    'components/speedrun',
    'components/nameplates'
], function (setBackground, speedrun, nameplates) {
    'use strict';

    var LAYOUT_NAME = '3x2_2';

    return {
        attached: function () {
            setBackground(LAYOUT_NAME);

            speedrun.configure(0, 481, 430, 184, {
                nameY: 35,
                categoryY: 124,
                nameMaxHeight: 90
            });

            nameplates.configure({
                nameFontSize: 28,
                estimateFontSize: 18,
                timeFontSize: 48,
                width: 430,
                height: 52,
                y: 427,
                bottomBorder: true,
                audioIcon: true
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
