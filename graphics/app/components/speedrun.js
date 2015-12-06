/* global define, TimelineLite, Power1, Linear */
define([
    'preloader',
    'globals',
    'classes/stage'
], function (preloader, globals, Stage) {
    'use strict';

    var BOXART_WIDTH = 469;
    var BOXART_ASPECT_RATIO = 1.397;
    var CONSOLE_WIDTH = 34;
    var BG_SCROLL_TIME = 30;
    var BG_FADE_TIME = 2;

    // We'll be changing these every time we switch to a new layout.
    // The "g" here means "Global". IDK, just some way of signifying these vars are permanent.
    var gWidth, gHeight, gOpts, boxartHeight;

    var createjs = requirejs('easel');
    var stage = new Stage(0, 0, 'speedrun');
    var shadow = new createjs.Shadow('black', 2, 2, 0);

    /* ----- */

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

    /* ----- */

    var name = new createjs.Text('', '800 29px proxima-nova', 'white');
    name.textAlign = 'end';
    name.shadow = shadow;

    /* ----- */

    var categoryContainer = new createjs.Container();
    categoryContainer.x = -2; // Hide the left stroke

    var category = new createjs.Text('', '600 18px proxima-nova', 'black');
    category.x = 34;
    category.y = 4;

    var categoryBackground = new createjs.Shape();
    categoryBackground.graphics
        .beginStroke('#0075a1')
        .beginFill('white')
        .drawRect(0, 0, 0, 31);
    var categoryRect = categoryBackground.graphics.command;

    categoryContainer.addChild(categoryBackground, category);

    /* ----- */

    var estimateContainer = new createjs.Container();

    var estimate = new createjs.Text('', '600 18px proxima-nova', 'black');
    estimate.textAlign = 'right';
    estimate.y = 4;

    var estimateBackground = new createjs.Shape();
    estimateBackground.graphics
        .beginStroke('#0075a1')
        .beginFill('white')
        .drawRect(0, 0, 0, 31);
    var estimateRect = estimateBackground.graphics.command;

    estimateContainer.addChild(estimateBackground, estimate);
    window.estimateContainer = estimateContainer;

    /* ----- */

    var consoleBitmap = new createjs.Bitmap(preloader.getResult('console-psp'));

    /* ----- */

    var foreground = new createjs.Container();
    foreground.addChild(name, categoryContainer, estimateContainer, consoleBitmap);

    /* ----- */

    var stageMask = new createjs.Shape();
    var stageMaskRect = stageMask.graphics.drawRect(0, 0, 0, 0).command;
    stage.mask = stageMask;
    stage.addChild(bgContainer1, bgContainer2, foreground);

    /**
     *  Re-caches the foreground elements (name, console icon, estimate, category)
     */
    function recacheForeground() {
        foreground.cache(0, 0, gWidth, gHeight);
    }

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

        // TODO: For some reason, caching the boxart makes perf WAY WORSE in OBS1.
        //bgContainer1.cache(0, 0, gWidth, Math.ceil(boxartHeight));
        //bgContainer2.cache(0, 0, gWidth, Math.ceil(boxartHeight));

        // Reset the scroll
        clearInterval(boxartScrollInterval);
        if (currentBoxartScrollTl) currentBoxartScrollTl.clear();

        showingBg.alpha = 1;
        hiddenBg.alpha = 0;

        boxartScroll();
        boxartScrollInterval = setInterval(boxartScroll, (BG_SCROLL_TIME - BG_FADE_TIME) * 1000);
    }

    function calcAndSetNameStyle() {
        if (typeof gOpts === 'undefined') return;

        name.scaleX = name.scaleY = gOpts.scale;

        if (name.text.indexOf('\n') >= 0) {
            name.regY = 8;
            name.textBaseline = 'top';
            name.y = gOpts.nameY;
        } else {
            name.regY = 0;
            name.textBaseline = 'middle';

            var maxWidth = gWidth - (gWidth * 0.12);
            var nameBounds = name.getTransformedBounds();
            var nameScalar = maxWidth / nameBounds.width;

            if (nameBounds.height * nameScalar > gOpts.nameMaxHeight) {
                nameScalar = gOpts.nameMaxHeight / nameBounds.height;
            }

            name.scaleX = name.scaleY *= nameScalar;
            name.y = (gOpts.nameY + (gOpts.categoryY - gOpts.nameY) / 2);
        }
    }

    // This needs to be near the bottom of this file.
    globals.currentRunRep.on('change', function(oldVal, newVal) {
        // Set the boxart
        // TODO: give this a nice fade transition, rather than a hard cut
        var img = document.createElement('img');
        img.src = newVal.boxart.url;
        background1.image = background2.image = img;
        redrawBoxartAfterImageLoad();

        name.text = newVal.name.toUpperCase();

        category.text = newVal.category;
        categoryRect.w = category.x + category.getBounds().width + 43;

        estimate.text = newVal.estimate;
        estimateRect.w = category.x + estimate.getBounds().width + 43;
        estimate.x = estimateRect.w - 34;
        estimateContainer.regX = estimateRect.w - 2;

        // EaselJS has problems applying  shadows to stroked graphics.
        // To work around this, we remove the shadow, cache the graphic, then apply the shadow to the cache.
        categoryBackground.shadow = null;
        categoryBackground.cache(0, 0, categoryRect.w, categoryRect.h);
        categoryBackground.shadow = shadow;
        estimateBackground.shadow = null;
        estimateBackground.cache(0, 0, estimateRect.w, estimateRect.h);
        estimateBackground.shadow = shadow;

        calcAndSetNameStyle();
        recacheForeground();
    });


    return {
        disable: function() {
            stage.visible = false;
            stage.paused = true;
            stage.canvas.style.display = 'none';
        },

        enable: function() {
            stage.visible = true;
            stage.paused = false;
            stage.canvas.style.display = 'block';
        },

        /**
         *  Sets the position and dimensions of the SpeedRun element.
         *  Transitions to the new position and dimenstions with a hard cut, and restarts the boxart scroll anim.
         *  @param {Number} x - The x position to set.
         *  @param {Number} y - The y position to set.
         *  @param {Number} w - The width to set.
         *  @param {Number} h - The height to set.
         *  @param {Object} opts - The options to set.
         *  @param {Number} opts.nameY - How far from the top to place the name.
         *  @param {Number} opts.nameMaxHeight - The maximum height of the name.
         *  @param {Number} opts.categoryY - Hor far from the top to place the category.
         *  @param {Number} [opts.scale=1] - The scale to draw all the individual elements at.
         *  @param {Boolean} [opts.showEstimate] - Whether or not to show the run's estimate.
         */
        configure:  function (x, y, w, h, opts) {
            console.log('setSpeedRunDimensions | x: %s, y: %s, w: %s, h: %s', x, y, w, h);

            this.enable();
            stageMaskRect.w = w;
            stageMaskRect.h = h;

            if (typeof opts.nameY === 'undefined') {
                throw new Error('opts.nameY must be defined');
            } else if (typeof opts.nameMaxHeight === 'undefined') {
                throw new Error('opts.nameMaxHeight must be defined');
            } else if (typeof opts.categoryY === 'undefined') {
                throw new Error('opts.categoryY must be defined');
            }

            gOpts = opts;
            opts.scale = opts.scale || 1;
            opts.consolePosition = opts.consolePosition || 'right';

            gWidth = w;
            gHeight = h;

            stage.canvas.style.left = x + 'px';
            stage.canvas.style.top = y + 'px';

            /* Okay, this is a new one.
             * Enforcing a minimum canvas width of 330 and rounding the
             * canvas height up to the nearest hundred seems to have a dramatic positive impact on performance.
             */
            stage.canvas.width = Math.max(w, 330);
            stage.canvas.height = Math.max(Math.ceil(h/100)*100, 200);

            name.scaleX = name.scaleY = opts.scale;
            categoryContainer.scaleX = categoryContainer.scaleY = opts.scale;
            consoleBitmap.scaleX = consoleBitmap.scaleY = opts.scale;

            name.x = w - 10;

            categoryContainer.y = opts.categoryY;

            if (opts.showEstimate) {
                estimateContainer.visible = true;
                estimateContainer.x = gWidth;
                estimateContainer.y = categoryContainer.y + categoryRect.h + 14;
                estimate.x = estimateRect.w - 34;

                consoleBitmap.y = estimateContainer.y;
                consoleBitmap.regX = 0;
                consoleBitmap.x = 8;
            } else {
                estimateContainer.visible = false;
                consoleBitmap.regX = CONSOLE_WIDTH-4;
                consoleBitmap.x = w - 8;
                consoleBitmap.y = categoryContainer.y;
            }

            redrawBoxartAfterImageLoad();
            calcAndSetNameStyle();
            recacheForeground();
        }
    };
});
