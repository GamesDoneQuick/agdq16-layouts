/* global define */
define([
    'components/background',
    'components/speedrun',
    'components/compact_nameplates',
    'components/nameplates'
], function(setBackground, speedrun, compactNameplates, nameplates) {
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

            nameplates.disable();

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
                    y: 334,
                    bottomBorder: true
                }
            ]);
        },

        detached: function() {
            compactNameplates.disable();
        }
    };
});
