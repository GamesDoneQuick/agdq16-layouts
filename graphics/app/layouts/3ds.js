/* global define */
define([
    'components/background',
    'components/speedrun',
    'components/nameplates'
], function (setBackground, speedrun, nameplates) {
    'use strict';

    var LAYOUT_NAME = '3ds';
    var sponsorsAndTwitter = document.getElementById('sponsorsAndTwitter');
    var sponsorDisplay = document.querySelector('sponsor-display');
    var twitterDisplay = document.querySelector('twitter-display');

    return {
        attached: function() {
            setBackground(LAYOUT_NAME);

            speedrun.configure(0, 567, 335, 98, {
                scale: 0.834,
                nameY: 10,
                nameMaxHeight: 50,
                categoryY: 64
            });

            nameplates.configure({},[{
                x: 335,
                y: 581,
                width: 592,
                height: 70,
                nameFontSize: 40,
                estimateFontSize: 28,
                timeFontSize: 68
            }]);

            sponsorsAndTwitter.style.top = '477px';
            sponsorsAndTwitter.style.left = '928px';
            sponsorsAndTwitter.style.width = '352px';
            sponsorsAndTwitter.style.height = '188px';

            sponsorDisplay.orientation = 'horizontal';
            sponsorDisplay.style.padding = '20px 20px';

            twitterDisplay.bodyStyle = {
                fontSize: 25,
                top: 19,
                horizontalMargin: 10
            };

            twitterDisplay.namebarStyle = {
                top: 137,
                width: 316,
                fontSize: 22
            };
        }
    };
});
