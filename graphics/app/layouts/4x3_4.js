/* global define */
define([
    'components/background',
    'components/speedrun',
    'components/compact_nameplates'
], function(setBackground, speedrun, compactNameplates) {
    'use strict';

    var LAYOUT_NAME = '4x3_4';

    return {
        attached: function() {
            setBackground(LAYOUT_NAME);

            speedrun.configure(442, 154, 396, 170, {
                nameY: 20,
                categoryY: 81,
                nameMaxHeight: 70,
                showEstimate: true
            });

            compactNameplates.configure([
                {
                    threeOrMore: true,
                    bottomBorder: true
                },{
                    threeOrMore: true,
                    y: 78,
                    alignRight: true
                },{
                    threeOrMore: true,
                    y: 511,
                    bottomBorder: true
                },{
                    threeOrMore: true,
                    y: 589,
                    alignRight: true
                }
            ]);
        },

        detached: function() {
            compactNameplates.disable();
        }
    };
});
