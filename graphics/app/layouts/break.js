/* global define, requirejs, TimelineMax, Power2 */
define([
    'classes/stage',
    'components/background',
    'components/speedrun',
    'components/nameplates',
    'globals'
], function(Stage, setBackground, speedrun, nameplates, globals) {
    'use strict';

    var LAYOUT_NAME = 'break';
    var STAGE_WIDTH = 371;
    var STAGE_HEIGHT = 330;
    var DESCRIPTION_HEIGHT = 53;

    var nowPlaying = document.querySelector('now-playing');
    var sponsorsAndTwitter = document.getElementById('sponsorsAndTwitter');
    var sponsorDisplay = document.querySelector('sponsor-display');
    var twitterDisplay = document.querySelector('twitter-display');

    var createjs = requirejs('easel');
    var stage = new Stage(STAGE_WIDTH, STAGE_HEIGHT, 'break-prizes');
    stage.canvas.style.top = '308px';
    stage.canvas.style.right = '0px';
    stage.canvas.style.backgroundColor = 'black';

    // Start hidden
    stage.visible = false;
    stage.paused = true;
    stage.canvas.style.display = 'none';

    /* ----- */

    var labelContainer = new createjs.Container();
    labelContainer.x = STAGE_WIDTH - 203;

    var labelBackground = new createjs.Shape();
    labelBackground.graphics.beginFill('#00aeef').drawRect(0, 0, 203, 27);
    labelBackground.alpha = 0.78;

    var labelText = new createjs.Text('RAFFLE PRIZES', '800 24px proxima-nova', 'white');
    labelText.x = 14;
    labelText.y = 0;

    labelContainer.addChild(labelBackground, labelText);
    labelContainer.cache(0, 0, 203, 27);

    /* ----- */

    var descriptionContainer = new createjs.Container();
    descriptionContainer.y = STAGE_HEIGHT - DESCRIPTION_HEIGHT;

    var descriptionBackground = new createjs.Shape();
    descriptionBackground.graphics.beginFill('#00aeef').drawRect(0, 0, STAGE_WIDTH, DESCRIPTION_HEIGHT);
    descriptionBackground.alpha = 0.73;

    var descriptionText = new createjs.Text('', '800 22px proxima-nova', 'white');
    descriptionText.x = 8;
    descriptionText.y = 3;
    descriptionText.lineWidth = STAGE_WIDTH - descriptionText.x * 2;

    descriptionContainer.addChild(descriptionBackground, descriptionText);

    /* ----- */

    var currentImage = new createjs.Bitmap();
    var nextImage = new createjs.Bitmap();
    stage.addChild(currentImage, nextImage, labelContainer, descriptionContainer);

    /* ----- */

    var TRANSITION_DURATION = 1.2;
    var DESCRIPTION_TRANSITION_DURATON = TRANSITION_DURATION / 2 - 0.1;

    var preloadedImages = {};
    var tl = new TimelineMax({repeat: -1});
    globals.currentPrizesRep.on('change', function (oldVal, newVal) {
        tl.clear();
        newVal.forEach(function (prize) {
            showPrize(prize);
        });
    });

    function showPrize(prize) {
        var imgEl;
        if (preloadedImages[prize.name]) {
            imgEl = preloadedImages[prize.name];
        } else {
            imgEl = document.createElement('img');
            imgEl.src = prize.image;
            preloadedImages[prize.name] = imgEl;
        }

        tl.call(function() {
            nextImage.x = STAGE_WIDTH;
            nextImage.image = imgEl;
            if (!imgEl.complete) {
                tl.pause();
                imgEl.addEventListener('load', function() {
                    tl.play();
                });
            }
        }, null, null, '+=0.1');

        tl.add('prizeEnter');

        tl.to(currentImage, TRANSITION_DURATION, {
            x: -STAGE_WIDTH,
            ease: Power2.easeInOut
        }, 'prizeEnter');

        tl.to(nextImage, TRANSITION_DURATION, {
            x: 0,
            ease: Power2.easeInOut,
            onComplete: function() {
                currentImage.image = imgEl;
                currentImage.x = 0;
                nextImage.x = STAGE_WIDTH;
            }
        }, 'prizeEnter');

        tl.to(descriptionContainer, DESCRIPTION_TRANSITION_DURATON, {
            y: STAGE_HEIGHT,
            ease: Power2.easeIn,
            onComplete: function() {
                descriptionText.text = prize.description || prize.name;
                descriptionContainer.cache(0, 0, STAGE_WIDTH, DESCRIPTION_HEIGHT);
            }
        }, 'prizeEnter');

        tl.to(descriptionContainer, DESCRIPTION_TRANSITION_DURATON, {
            y: STAGE_HEIGHT - DESCRIPTION_HEIGHT,
            ease: Power2.easeOut
        }, '-=' + DESCRIPTION_TRANSITION_DURATON);

        tl.to({}, globals.displayDuration, {});
    }

    return {
        attached: function() {
            setBackground(LAYOUT_NAME);
            speedrun.disable();
            nameplates.disable();
            stage.visible = true;
            stage.paused = false;
            stage.canvas.style.display = 'block';

            nowPlaying.style.display = 'flex';

            sponsorsAndTwitter.style.top = '479px';
            sponsorsAndTwitter.style.left = '387px';
            sponsorsAndTwitter.style.width = '516px';
            sponsorsAndTwitter.style.height = '146px';

            sponsorDisplay.style.display = 'none';

            twitterDisplay.style.zIndex = '-1';
            twitterDisplay.bodyStyle = {
                fontSize: 21,
                top: 15,
                horizontalMargin: 13
            };
            twitterDisplay.namebarStyle = {
                top: 98,
                width: 305,
                fontSize: 20
            };
        },
        detached: function() {
            stage.visible = false;
            stage.paused = true;
            stage.canvas.style.display = 'none';
            nowPlaying.style.display = 'none';
            sponsorDisplay.style.display = 'block';
            twitterDisplay.style.zIndex = '';
        }
    };
});
