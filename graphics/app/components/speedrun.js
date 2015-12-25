/* global define, requirejs, TimelineLite, Power1, Linear */
define([
    'preloader',
    'globals',
    'classes/stage',
    'debug'
], function (preloader, globals, Stage, debug) {
    'use strict';

    var BOXART_WIDTH = 469;
    var BOXART_ASPECT_RATIO = 1.397;
    var BOXART_SCROLL_TIME = 30;
    var BOXART_FADE_TIME = 2;

    // We'll be changing these every time we switch to a new layout.
    // The "g" here means "Global". IDK, just some way of signifying these vars are permanent.
    var gWidth, gHeight, gOpts, gBoxartImage, boxartHeight;

    var createjs = requirejs('easel');
    var stage = new Stage(0, 0, 'speedrun');
    var shadow = new createjs.Shadow('black', 2, 2, 0);

    /* ----- */

    var boxartContainer1 = new createjs.Container();
    var boxartContainer2 = new createjs.Container();

    var color1 = new createjs.Shape();
    var color2 = new createjs.Shape();

    var boxart1 = new createjs.Bitmap();
    boxart1.alpha = 0.3;
    boxart1.compositeOperation = 'luminosity';
    var boxart2 = boxart1.clone();

    boxartContainer1.addChild(color1, boxart1);
    boxartContainer2.addChild(color2, boxart2);

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

    var categoryBoxart = new createjs.Shape();
    categoryBoxart.graphics
        .beginStroke('#0075a1')
        .beginFill('white')
        .drawRect(0, 0, 0, 31);
    var categoryRect = categoryBoxart.graphics.command;

    categoryContainer.addChild(categoryBoxart, category);

    /* ----- */

    var estimateContainer = new createjs.Container();

    var estimate = new createjs.Text('', '600 18px proxima-nova', 'black');
    estimate.textAlign = 'right';
    estimate.y = 4;

    var estimateBoxart = new createjs.Shape();
    estimateBoxart.graphics
        .beginStroke('#0075a1')
        .beginFill('white')
        .drawRect(0, 0, 0, 31);
    var estimateRect = estimateBoxart.graphics.command;

    estimateContainer.addChild(estimateBoxart, estimate);
    window.estimateContainer = estimateContainer;

    /* ----- */

    var consoleBitmap = new createjs.Bitmap();

    /* ----- */

    var foreground = new createjs.Container();
    foreground.addChild(name, categoryContainer, estimateContainer, consoleBitmap);

    /* ----- */

    var stageMask = new createjs.Shape();
    var stageMaskRect = stageMask.graphics.drawRect(0, 0, 0, 0).command;
    stage.mask = stageMask;
    stage.addChild(boxartContainer1, boxartContainer2, foreground);

    /**
     *  Re-caches the foreground elements (name, console icon, estimate, category)
     */
    function recacheForeground() {
        foreground.cache(0, 0, gWidth, gHeight);
    }

    var showingBoxart = boxartContainer1;
    var hiddenBoxart = boxartContainer2;
    var currentBoxartScrollTl;
    var boxartScrollInterval;

    /**
     *  Does one iteration of the boxart scroll animation.
     */
    function boxartScroll() {
        var tl = new TimelineLite();
        currentBoxartScrollTl = tl;

        tl.fromTo(showingBoxart, BOXART_SCROLL_TIME + BOXART_FADE_TIME,
            {y: 0},
            {
                immediateRender: false,
                y: gHeight - boxartHeight,
                ease: Linear.easeNone
            }
        );

        tl.add('crossfade', BOXART_SCROLL_TIME);
        tl.to(showingBoxart, BOXART_FADE_TIME, {
            onStart: function() {
                debug.time('boxartCrossfade');
            },
            alpha: 0,
            ease: Power1.easeInOut,
            onComplete: function(boxartWeJustHid) {
                if (boxartWeJustHid.image !== gBoxartImage) {
                    recacheBoxartAfterImageLoad(boxartWeJustHid);
                }
            },
            onCompleteParams: [showingBoxart]
        }, 'crossfade');
        tl.to(hiddenBoxart, BOXART_FADE_TIME, {
            alpha: 1,
            ease: Power1.easeInOut,
            onComplete: function() {
                debug.timeEnd('boxartCrossfade');
            }
        }, 'crossfade');

        var tmp = showingBoxart;
        showingBoxart = hiddenBoxart;
        hiddenBoxart = tmp;
    }

    /**
     *  Waits for the boxart image to be fully loaded, then redraws both boxart elements.
     */
    function recacheBoxartAfterImageLoad(boxartContainer) {
        var bitmap = boxartContainer.children[1];
        if (!bitmap.image) return;

        bitmap.image = gBoxartImage;
        if (bitmap.image.complete) {
            cacheBoxartContainer(boxartContainer);
        } else {
            bitmap.image.addEventListener('load', function() {
                cacheBoxartContainer(boxartContainer);
            });
        }
    }

    function cacheBoxartContainer(boxartContainer) {
        boxartContainer.cache(0, 0, gWidth, Math.ceil(boxartHeight));
    }

    function reformatBoxart() {
        boxartHeight = gWidth * BOXART_ASPECT_RATIO;
        boxart1.scaleX = boxart2.scaleX = gWidth / BOXART_WIDTH;
        boxart1.scaleY = boxart2.scaleY = gWidth / BOXART_WIDTH;
        color1.graphics.clear().beginFill('#00ADEF').drawRect(0, 0, gWidth, boxartHeight);
        color2.graphics.clear().beginFill('#00ADEF').drawRect(0, 0, gWidth, boxartHeight);

        // Caching seems to have no discernible performance benefit in this particular case,
        // and in OBS1 CLR Browser Sources actually seems to make performance far worse.
        boxart1.image = gBoxartImage;
        boxart2.image = gBoxartImage;
        cacheBoxartContainer(boxartContainer1);
        cacheBoxartContainer(boxartContainer2);

        // Reset the scroll
        clearInterval(boxartScrollInterval);
        if (currentBoxartScrollTl) currentBoxartScrollTl.clear();

        showingBoxart.alpha = 1;
        hiddenBoxart.alpha = 0;

        boxartScroll();
        boxartScrollInterval = setInterval(boxartScroll, BOXART_SCROLL_TIME * 1000);
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

    function repositionConsole() {
        if (!gOpts) return;

        var bounds = consoleBitmap.getBounds();
        consoleBitmap.regY = (bounds.height - 4) / 2;

        if (gOpts.showEstimate) {
            consoleBitmap.regX = 0;
            consoleBitmap.x = 8;
            consoleBitmap.y = estimateContainer.y + (estimateContainer.getBounds().height - 2) / 2;
        } else {
            consoleBitmap.regX = consoleBitmap.getBounds().width;
            consoleBitmap.x = gWidth - 8;
            consoleBitmap.y = categoryContainer.y + (categoryContainer.getBounds().height - 2) / 2;
        }
    }

    // This needs to be near the bottom of this file.
    globals.currentRunRep.on('change', function(oldVal, newVal) {
        var img = document.createElement('img');
        img.src = newVal.boxart.url;
        gBoxartImage = img;

        // If we have at least BOXART_FADE_TIME before the next fade begins,
        // immediately load the new boxart into hiddenBoxart so its shows ASAP.
        if(currentBoxartScrollTl) {
            var currentTime = currentBoxartScrollTl.time();
            if (currentTime > BOXART_FADE_TIME
                    && currentTime < currentBoxartScrollTl.duration() - BOXART_FADE_TIME * 2) {
                // This is confusing. You'd think it'd be hiddenBoxart that we change, but no.
                // This is becuase they're flipped immediately every time showBoxart() is called.
                recacheBoxartAfterImageLoad(showingBoxart);
            }
        }

        name.text = newVal.name.toUpperCase();

        category.text = newVal.category;
        categoryRect.w = category.x + category.getBounds().width + 43;

        estimate.text = newVal.estimate;
        estimateRect.w = category.x + estimate.getBounds().width + 43;
        estimate.x = estimateRect.w - 34;
        estimateContainer.regX = estimateRect.w - 2;

        consoleBitmap.image = preloader.getResult('console-' + newVal.console.toLowerCase());

        // EaselJS has problems applying shadows to stroked graphics.
        // To work around this, we remove the shadow, cache the graphic, then apply the shadow to the cache.
        categoryBoxart.shadow = null;
        categoryBoxart.cache(0, 0, categoryRect.w, categoryRect.h);
        categoryBoxart.shadow = shadow;
        estimateBoxart.shadow = null;
        estimateBoxart.cache(0, 0, estimateRect.w, estimateRect.h);
        estimateBoxart.shadow = shadow;

        calcAndSetNameStyle();
        repositionConsole();
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
            debug.log('[speedun] setSpeedRunDimensions(%s, %s, %s, %s)', x, y, w, h);

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

            name.x = w - 10;

            categoryContainer.y = opts.categoryY;

            if (opts.showEstimate) {
                estimateContainer.visible = true;
                estimateContainer.x = gWidth;
                estimateContainer.y = categoryContainer.y + categoryRect.h + 14;
                estimate.x = estimateRect.w - 34;
            } else {
                estimateContainer.visible = false;
            }

            reformatBoxart();
            calcAndSetNameStyle();
            repositionConsole();
            recacheForeground();
        }
    };
});
