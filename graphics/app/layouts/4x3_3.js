/* global define */
define([
    'components/background',
    'components/speedrun',
    'components/compact_nameplates'
], function(setBackground, speedrun, compactNameplates) {
    'use strict';

    var LAYOUT_NAME = '4x3_3';

    return {
        attached: function() {
            setBackground(LAYOUT_NAME);

            speedrun.configure(442, 154, 396, 179, {
                nameY: 17,
                categoryY: 84,
                showEstimate: true,
                nameMaxHeight: 80
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
                }
            ]);
        },

        detached: function() {
            compactNameplates.disable();
        }
    };
});
