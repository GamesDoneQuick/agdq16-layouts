/* global define */
define([
    'components/background',
    'components/speedrun',
    'components/nameplates'
], function (setBackground, speedrun, nameplates) {
    'use strict';

    var LAYOUT_NAME = '4x3_1';
    var COLUMN_WIDTH = 398;
    var COLUMN_X = 882;
    var sponsorsAndTwitter = document.getElementById('sponsorsAndTwitter');
    var sponsorDisplay = document.querySelector('sponsor-display');
    var twitterDisplay = document.querySelector('twitter-display');

    return {
        attached: function() {
            setBackground(LAYOUT_NAME);

            speedrun.configure(COLUMN_X, 0, COLUMN_WIDTH, 146, {
                nameY: 28,
                categoryY: 94,
                nameMaxHeight: 80
            });

            nameplates.configure({},[{
                x: COLUMN_X,
                y: 383,
                width: COLUMN_WIDTH,
                height: 52,
                nameFontSize: 24,
                estimateFontSize: 18,
                timeFontSize: 48,
                bottomBorder: true
            }]);

            sponsorsAndTwitter.style.top = '437px';
            sponsorsAndTwitter.style.left = COLUMN_X + 'px';
            sponsorsAndTwitter.style.width = COLUMN_WIDTH + 'px';
            sponsorsAndTwitter.style.height = '228px';

            sponsorDisplay.orientation = 'horizontal';
            sponsorDisplay.style.padding = '20px 20px';

            twitterDisplay.bodyStyle = {
                fontSize: 24,
                top: 39,
                horizontalMargin: 14
            };
            twitterDisplay.namebarStyle = {
                top: 160,
                width: 373,
                fontSize: 28
            };
        }
    };
});
