/* global define */
define([
    'components/background',
    'components/speedrun',
    'components/nameplates'
], function (setBackground, speedrun, nameplates) {
    'use strict';

    var LAYOUT_NAME = '4x3_2';
    var COLUMN_WIDTH = 430;
    var RIGHT_COLUMN_X = 850;
    var sponsorsAndTwitter = document.getElementById('sponsorsAndTwitter');
    var sponsorDisplay = document.querySelector('sponsor-display');
    var twitterDisplay = document.querySelector('twitter-display');

    return {
        attached: function() {
            setBackground(LAYOUT_NAME);

            speedrun.configure(0, 536, COLUMN_WIDTH, 130, {
                nameY: 15,
                categoryY: 81,
                nameMaxHeight: 80
            });

            nameplates.configure({
                nameFontSize: 28,
                estimateFontSize: 18,
                timeFontSize: 48,
                width: COLUMN_WIDTH,
                height: 52,
                y: 481,
                bottomBorder: true,
                audioIcon: true
            },[
                {
                    x: 0,
                    alignment: 'right'
                },{
                    x: RIGHT_COLUMN_X,
                    alignment: 'left'
                }
            ]);

            sponsorsAndTwitter.style.top = '535px';
            sponsorsAndTwitter.style.left = RIGHT_COLUMN_X + 'px';
            sponsorsAndTwitter.style.width = COLUMN_WIDTH + 'px';
            sponsorsAndTwitter.style.height = '130px';

            sponsorDisplay.orientation = 'horizontal';
            sponsorDisplay.style.padding = '0px 0px';

            twitterDisplay.bodyStyle = {
                fontSize: 17,
                top: 11,
                horizontalMargin: 10
            };
            twitterDisplay.namebarStyle = {
                top: 86,
                width: 373,
                fontSize: 26
            };
        }
    };
});
