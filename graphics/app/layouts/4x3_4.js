/* global define */
define([
    'components/background',
    'components/speedrun',
    'components/compact_nameplates',
    'components/nameplates'
], function(setBackground, speedrun, compactNameplates, nameplates) {
    'use strict';

    var LAYOUT_NAME = '4x3_4';
    var sponsorsAndTwitter = document.getElementById('sponsorsAndTwitter');

    return {
        attached: function() {
            setBackground(LAYOUT_NAME);

            speedrun.configure(442, 154, 396, 170, {
                nameY: 20,
                categoryY: 81,
                nameMaxHeight: 70,
                showEstimate: true
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
                    y: 511,
                    bottomBorder: true
                },{
                    threeOrMore: true,
                    y: 589,
                    alignRight: true
                }
            ]);

            sponsorsAndTwitter.style.display = 'none';
        },

        detached: function() {
            compactNameplates.disable();
            sponsorsAndTwitter.style.display = 'block';
        }
    };
});
