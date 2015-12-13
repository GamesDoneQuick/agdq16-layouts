/* global define */
define([
    'components/background',
    'components/speedrun',
    'components/nameplates'
], function (setBackground, speedrun, nameplates) {
    'use strict';

    var LAYOUT_NAME = '16x9_1';
    var sponsorsAndTwitter = document.getElementById('sponsorsAndTwitter');
    var sponsorDisplay = document.querySelector('sponsor-display');
    var twitterDisplay = document.querySelector('twitter-display');

    return {
        attached: function() {
            setBackground(LAYOUT_NAME);

            speedrun.configure(0, 543, 469, 122, {
                nameY: 10,
                categoryY: 74,
                nameMaxHeight: 70
            });

            nameplates.configure({},[{
                x: 469,
                y: 572,
                width: 498,
                height: 65,
                nameFontSize: 35,
                estimateFontSize: 23,
                timeFontSize: 61
            }]);

            sponsorsAndTwitter.style.top = '302px';
            sponsorsAndTwitter.style.left = '967px';
            sponsorsAndTwitter.style.width = '313px';
            sponsorsAndTwitter.style.height = '363px';

            sponsorDisplay.orientation = 'vertical';
            sponsorDisplay.style.padding = '20px 20px';

            twitterDisplay.bodyStyle = {
                fontSize: 26,
                top: 57,
                horizontalMargin: 22
            };

            twitterDisplay.namebarStyle = {
                top: 264,
                width: 297,
                fontSize: 21
            };
        }
    };
});
