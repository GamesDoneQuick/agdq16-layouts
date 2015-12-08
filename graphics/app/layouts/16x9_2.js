/* global define */
define([
    'components/background',
    'components/speedrun',
    'components/nameplates'
], function (setBackground, speedrun, nameplates) {
    'use strict';

    var LAYOUT_NAME = '16x9_2';

    return {
        attached: function() {
            setBackground(LAYOUT_NAME);

            speedrun.configure(0, 447, 420, 218, {
                nameY: 41,
                categoryY: 133,
                nameMaxHeight: 100
            });

            nameplates.configure({
                nameFontSize: 28,
                estimateFontSize: 18,
                timeFontSize: 48,
                width: 420,
                height: 51,
                y: 394,
                bottomBorder: true
            },[
                {
                    x: 0,
                    alignment: 'right'
                },{
                    x: 860,
                    alignment: 'left'
                }
            ]);
        }
    };
});
