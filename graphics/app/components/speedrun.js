/* global define, TimelineLite, Power1, Linear */
define([
    'globals',
    'classes/Stage'
], function (globals, Stage) {
    'use strict';

    var BOXART_WIDTH = 469;
    var BOXART_ASPECT_RATIO = 1.397;
    var BG_SCROLL_TIME = 30;
    var BG_FADE_TIME = 2;

    // We'll be changing these every time we switch to a new layout.
    // The "g" here means "Global". IDK, just some way of signifying these vars are permanent.
    var gWidth, gHeight, boxartHeight;

    var createjs = require('easel');
    var stage = new Stage(0, 0, 'speedrun');

    var bgContainer1 = new createjs.Container();
    var bgContainer2 = new createjs.Container();

    var color1 = new createjs.Shape();
    var color2 = new createjs.Shape();

    var background1 = new createjs.Bitmap();
    background1.alpha = 0.3;
    background1.compositeOperation = 'luminosity';
    var background2 = background1.clone();

    bgContainer1.addChild(color1, background1);
    bgContainer2.addChild(color2, background2);

    var name = new createjs.Text('', '800 30px proxima-nova', 'white');
    name.textAlign = 'end';
    name.shadow = new createjs.Shadow('black', 3, 3, 0);

    stage.addChild(bgContainer1, bgContainer2, name);

    globals.currentRunRep.on('change', function(oldVal, newVal) {
        // Set the boxart
        // TODO: give this a nice fade transition, rather than a hard cut
        var img = document.createElement('img');
        img.src = newVal.boxart.url;
        background1.image = background2.image = img;
        redrawBoxartAfterImageLoad();
        resetBoxartScroll();

        name.text = newVal.name;
    });

    /**
     *  Does one iteration of the boxart scroll animation.
     */
    var showingBg = bgContainer1;
    var hiddenBg = bgContainer2;
    var currentBoxartScrollTl;
    var boxartScrollInterval;
    function boxartScroll() {
        var tl = new TimelineLite();
        currentBoxartScrollTl = tl;

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
     *  Waits for the boxart image to be fully loaded, then redraws both background elements.
     */
    function redrawBoxartAfterImageLoad() {
        if (!background1.image) return;

        if (background1.image.complete) {
            redrawAndCacheBoxart();
        } else {
            background1.image.addEventListener('load', redrawAndCacheBoxart);
        }
    }

    /**
     *  Re-draws and re-caches the boxart to fit the current width.
     */
    function redrawAndCacheBoxart() {
        boxartHeight = gWidth * BOXART_ASPECT_RATIO;
        background1.scaleX = background2.scaleX = gWidth / BOXART_WIDTH;
        background1.scaleY = background2.scaleY = gWidth / BOXART_WIDTH;
        color1.graphics.clear().beginFill('#00ADEF').drawRect(0, 0, gWidth, boxartHeight);
        color2.graphics.clear().beginFill('#00ADEF').drawRect(0, 0, gWidth, boxartHeight);
        bgContainer1.cache(0, 0, gWidth, boxartHeight);
        bgContainer2.cache(0, 0, gWidth, boxartHeight);
    }

    /**
     *  A hard cut to a new iteration of the boxart scrolling animation.
     *  To be used when changing to a new layout and a hard cut is needed.
     */
    function resetBoxartScroll() {
        clearInterval(boxartScrollInterval);
        if (currentBoxartScrollTl) currentBoxartScrollTl.clear();

        showingBg.alpha = 1;
        hiddenBg.alpha = 0;

        boxartScroll();
        boxartScrollInterval = setInterval(boxartScroll, (BG_SCROLL_TIME - BG_FADE_TIME) * 1000);
    }

    /**
     *  Sets the position and dimensions of the SpeedRun element.
     *  Transitions to the new position and dimenstions with a hard cut, and restarts the boxart scroll anim.
     *  @param {Number} x - The x position to set.
     *  @param {Number} y - The y position to set.
     *  @param {Number} w - The width to set.
     *  @param {Number} h - The height to set.
     *  @param {Object} [opts.nameSize] - The font size of the speedrun name.
     *  @param {Object} [opts.categoryAndEstimateSize] - The font size of the category and estimate.
     */
    return function (x, y, w, h) {
        console.log('setSpeedRunDimensions | x: %s, y: %s, w: %s, h: %s', x, y, w, h);

        gWidth = w;
        gHeight = h;

        stage.canvas.style.left = x + 'px';
        stage.canvas.style.top = y + 'px';
        stage.canvas.width = w;
        stage.canvas.height = h;

        name.x = w - 10;
        name.y = h * 0.12;

        redrawBoxartAfterImageLoad();
        resetBoxartScroll();
    };
});
