/* global define */
define([
    'components/background',
    'components/speedrun',
    'components/compact_nameplates',
    'components/nameplates'
], function(setBackground, speedrun, compactNameplates, nameplates) {
    'use strict';

    var LAYOUT_NAME = '4x3_3';
    var COLUMN_WIDTH = 396;
    var COLUMN_X = 442;
    var sponsorsAndTwitter = document.getElementById('sponsorsAndTwitter');
    var sponsorDisplay = document.querySelector('sponsor-display');
    var twitterDisplay = document.querySelector('twitter-display');

    return {
        attached: function() {
            setBackground(LAYOUT_NAME);

            speedrun.configure(COLUMN_X, 154, COLUMN_WIDTH, 179, {
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

            sponsorsAndTwitter.style.top = '412px';
            sponsorsAndTwitter.style.left = COLUMN_X + 'px';
            sponsorsAndTwitter.style.width = COLUMN_WIDTH + 'px';
            sponsorsAndTwitter.style.height = '253px';

            sponsorDisplay.style.margin = '0px 0px';

            twitterDisplay.bodyStyle = {
                fontSize: 24,
                top: 50,
                horizontalMargin: 9
            };
            twitterDisplay.namebarStyle = {
                top: 164,
                width: 354,
                fontSize: 26
            };
        },

        detached: function() {
            compactNameplates.disable();
        }
    };
});
