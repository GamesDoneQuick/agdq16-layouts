/* global define, TimelineLite, Power1, Linear */
define(['classes/Stage'], function (Stage) {
    'use strict';

    var BG_SCROLL_TIME = 30;
    var BG_FADE_TIME = 2;

    // We'll be changing these every time we switch to a new layout.
    // The "g" here means "Global". IDK, just some way of signifying these two vars are permanent.
    var gWidth, gHeight, boxartHeight;

    var createjs = require('easel');
    var stage = new Stage(0, 0, 'speedrun');

    var boxart = nodecg.Replicant('boxart');
    boxart.on('change', function () {
        //background.src = newVal;
    });

    var bgContainer1 = new createjs.Container();
    var bgContainer2 = new createjs.Container();
    bgContainer2.alpha = 0;
    stage.addChild(bgContainer1, bgContainer2);

    var color1 = new createjs.Shape();
    var color2 = new createjs.Shape();

    var background1 = new createjs.Bitmap();
    background1.alpha = 0.3;
    background1.compositeOperation = 'luminosity';
    var background2 = background1.clone();

    bgContainer1.addChild(color1, background1);
    bgContainer2.addChild(color2, background2);

    var showingBg = bgContainer1;
    var hiddenBg = bgContainer2;
    var currentBgScrollTl;
    var bgScrollInterval;

    /**
     *  Does one iteration of the boxart scroll animation.
     */
    function bgScroll() {
        var tl = new TimelineLite();
        currentBgScrollTl = tl;

        tl.fromTo(showingBg, BG_SCROLL_TIME,
            {y: 0},
            {
                immediateRender: false,
                y: gHeight - boxartHeight,
                ease: Linear.easeNone
            }
        );

        tl.add('crossfade', BG_SCROLL_TIME - BG_FADE_TIME);
        tl.to(showingBg, BG_FADE_TIME, {
            alpha: 0,
            ease: Power1.easeInOut
        }, 'crossfade');
        tl.to(hiddenBg, BG_FADE_TIME, {
            alpha: 1,
            ease: Power1.easeInOut
        }, 'crossfade');
        tl.fromTo(hiddenBg, BG_SCROLL_TIME,
            {y: 0},
            {
                immediateRender: false,
                y: gHeight - boxartHeight,
                ease: Linear.easeNone
            }
        , 'crossfade');

        var tmp = showingBg;
        showingBg = hiddenBg;
        hiddenBg = tmp;
    }

    /**
     *  Waits for the boxart image to be fully loaded, then caches both background elements.
     */
    function cacheBackgroundAfterImageLoad() {
        if (background1.image.complete) {
            cacheBackground();
        } else {
            background1.image.addEventListener('load', cacheBackground);
        }
    }

    /**
     * Caches the two background elements which contain the boxart.
     */
    function cacheBackground() {
        bgContainer1.cache(0, 0, gWidth, boxartHeight);
        bgContainer2.cache(0, 0, gWidth, boxartHeight);
    }

    /**
     *  Requests the current SpeedRun's boxart at the current width. Height is automatically calculated.
     */
    function requestBoxArt() {
        nodecg.sendMessage('requestBoxArt', gWidth, function(data) {
            boxartHeight = data.height;
            var img = document.createElement('img');
            img.src = data.url;
            background1.image = img;
            background2.image = img;
            color1.graphics.clear().beginFill('#00ADEF').drawRect(0, 0, gWidth, boxartHeight);
            color2.graphics.clear().beginFill('#00ADEF').drawRect(0, 0, gWidth, boxartHeight);
            cacheBackgroundAfterImageLoad();
            resetBgScroll();
        });
    }

    /**
     *  A hard cut to a new iteration of the boxart scrolling animation.
     *  To be used when changing to a new layout and a hard cut is needed.
     */
    function resetBgScroll() {
        clearInterval(bgScrollInterval);
        if (currentBgScrollTl) currentBgScrollTl.clear();

        showingBg.alpha = 1;
        hiddenBg.alpha = 0;

        bgScroll();
        bgScrollInterval = setInterval(bgScroll, (BG_SCROLL_TIME - BG_FADE_TIME) * 1000);
    }

    /**
     *  Sets the position and dimensions of the SpeedRun element.
     *  @param {Number} x - The x position to set.
     *  @param {Number} y - The y position to set.
     *  @param {Number} w - The width to set.
     *  @param {Number} h - The height to set.
     */
    return function (x, y, w, h) {
        gWidth = w;
        gHeight = h;
        stage.canvas.style.left = x + 'px';
        stage.canvas.style.top = y + 'px';
        stage.canvas.width = w;
        stage.canvas.height = h;
        requestBoxArt();
    };
});
