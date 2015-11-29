/* global define, TimelineLite, Power3, Power2, Power1, Elastic */
define([
    'preloader',
    'globals',
    'classes/Stage'
], function (preloader, globals, Stage) {
    'use strict';

    var OMNIBAR_HEIGHT = 55;

    var OMNIBAR_WIDTH_MINUS_LOGO = 1161;

    var createjs = require('easel');
    var stage = new Stage(1280, 72, 'omnibar');
    stage.canvas.style.position = 'absolute';
    stage.canvas.style.bottom = '0px';
    stage.canvas.style.zIndex = '1';

    var omnibar = new createjs.Container();
    omnibar.y = 17;
    stage.addChild(omnibar);

    var tl = new TimelineLite({autoRemoveChildren: true});
    var state = {};
    var displayDuration = 10;
    var lastShownGrandPrizeIdx = -1;

    /* ----- */

    var barBg = new createjs.Shape();
    barBg.graphics
        .beginFill('#0075a1')
        .drawRect(119, 0, OMNIBAR_WIDTH_MINUS_LOGO, OMNIBAR_HEIGHT);
    barBg.cache(119, 0, OMNIBAR_WIDTH_MINUS_LOGO, OMNIBAR_HEIGHT);

    /* ----- */

    var gdqLogo = new createjs.Bitmap(preloader.getResult('omnibar-logo-gdq'));

    /* ----- */

    var label = new createjs.Container();

    var labelBg = new createjs.Shape();
    labelBg.skewX = -10;
    labelBg.x = -10;

    var labelBgLayer3 = labelBg.graphics.beginFill('#034a65').drawRect(0, 0, 0, OMNIBAR_HEIGHT).command;
    var labelBgLayer2 = labelBg.graphics.beginFill('#0075a1').drawRect(-5, 0, 0, OMNIBAR_HEIGHT).command;
    var labelBgLayer1 = labelBg.graphics.beginFill('#034a65').drawRect(-10, 0, 0, OMNIBAR_HEIGHT).command;
    var labelBgLayers = [labelBgLayer3, labelBgLayer2, labelBgLayer1];

    var labelText = new createjs.Text();
    labelText.color = 'white';
    labelText.textAlign = 'center';
    labelText.x = 82;
    labelText.y = 22;
    labelText.mask = labelBg;

    label.addChild(labelBg, labelText);

    function setLabelText(text, size) {
        labelText.font = '800 ' + size + 'px proxima-nova';
        labelText.lineHeight = size - size * 0.2;
        labelText.text = text;
        labelText.regY = labelText.getBounds().height / 2;
    }

    function showLabel(text, size) {
        var tmpTL = new TimelineLite();

        if (state.labelShowing) {
            tmpTL.to(labelText, 0.25, {
                opacity: 0,
                ease: Power1.easeInOut,
                onComplete: setLabelText,
                onCompleteParams: [text, size]
            });

            tmpTL.to(labelText, 0.25, {
                opacity: 1,
                ease: Power1.easeInOut
            });
        }

        else {
            tmpTL.staggerTo(labelBgLayers, 1.2, {
                onStart: function () {
                    state.labelShowing = true;
                    setLabelText(text, size);
                },
                w: 180,
                ease: Elastic.easeOut.config(0.5, 0.5)
            }, 0.08);
        }

        return tmpTL;
    }

    //setLabel('BID WAR', 33);
    //setLabel('RAFFLE\nPRIZES', 30);

    /* ----- */

    var mainLine1 = new createjs.Text('', '800 18px proxima-nova', 'white');
    mainLine1.restingX = 186;
    mainLine1.restingY = 2;
    mainLine1.x = mainLine1.restingX;
    mainLine1.y = mainLine1.restingY;

    var mainLine2 = new createjs.Text('', '800 33px proxima-nova', 'white');
    mainLine2.restingX = 190;
    mainLine2.restingY = 18;
    mainLine2.x = 190;
    mainLine2.y = 18;

    function showMainLines(line1Text, line2Text) {
        var tmpTL = new TimelineLite();

        if (mainLine1.text || mainLine2.text) {
            tmpTL.add('exit');

            tmpTL.to(mainLine1, 0.5, {
                y: -18,
                ease: Power2.easeIn
            }, 'exit');

            tmpTL.to(mainLine2, 0.5, {
                y: 50,
                ease: Power2.easeIn
            }, 'exit');
        }

        tmpTL.to({}, 0.01, {onStart: function() {
            mainLine1.text = line1Text;
            mainLine2.text = line2Text;

            mainLine1.x = mainLine1.restingX - mainLine1.getBounds().width - 20;
            mainLine1.y = mainLine1.restingY;

            mainLine2.x = mainLine2.restingX - mainLine2.getBounds().width - 20;
            mainLine2.y = mainLine2.restingY;
        }});

        tmpTL.add('enter');

        tmpTL.to(mainLine1, 1.2, {
            x: mainLine1.restingX,
            ease: Power2.easeOut
        }, 'enter');

        tmpTL.to(mainLine2, 1.2, {
            x: mainLine2.restingX,
            ease: Power2.easeOut
        }, 'enter');

        return tmpTL;
    }

    /* ----- */

    var totalContainer = new createjs.Container();

    var totalLeftBorder = new createjs.Shape();
    totalLeftBorder.graphics.beginFill('white').drawRect(0, 0, 3, OMNIBAR_HEIGHT);

    var totalText = new createjs.Text('$1,560,259', '800 30px proxima-nova', 'white');
    totalText.x = 13;
    totalText.y = 10;

    var pcfLogo = new createjs.Bitmap(preloader.getResult('omnibar-logo-pcf'));
    pcfLogo.y = - 17;

    totalContainer.addChild(totalLeftBorder, totalText, pcfLogo);

    nodecg.Replicant('total').on('change', function(oldVal, newVal) {
        totalText.text = newVal;
        pcfLogo.x = totalText.x + totalText.getBounds().width + 6;
        var totalContainerWidth = totalContainer.getBounds().width;
        totalContainer.x = OMNIBAR_WIDTH_MINUS_LOGO - totalContainerWidth - 17;

        mainLine1.maxWidth = totalContainer.x - mainLine1.x - 12;
        mainLine2.maxWidth = mainLine1.maxWidth - 4;
    });

    /* ----- */

    // This is what holds the "Up Next", "Bid War", and "Raffle Prizes" modes.
    var mainContainer = new createjs.Container();
    mainContainer.x = 119;
    mainContainer.addChild(mainLine1, mainLine2, labelBg, labelText, totalContainer);

    omnibar.addChild(barBg, mainContainer, gdqLogo);

    /* ----- */

    function showUpNext(immediate) {
        if (globals.nextRun) {
            if (immediate) tl.clear();

            tl.call(showLabel, ['UP NEXT', 32]);

            // GSAP is dumb with `call` sometimes. Putting this in a near-zero duration tween seems to be more reliable.
            tl.to({}, 0.01, {
                onComplete: function() {
                    /* Depending on how we enter the very end of the schedule, we might end up in this func
                     * after window.nextRun has been set to null. In that case, we immediately clear the
                     * timeline and bail out to showing bids again.
                     */
                    if (globals.nextRun) {
                        mainLine1.text = globals.nextRun.runners.reduce(function(prev, curr) {
                            return prev + ', ' + curr.name;
                        });
                    } else {
                        tl.clear();
                        tl.call(showBids);
                    }
                }
            });

            tl.call(function() {
                mainLine2.text = globals.nextRun.game + ' - ' + globals.nextRun.category;
            }, null, null, '+=0.08');

            // Give it some time to show
            tl.to({}, displayDuration, {});
        }

        tl.call(showCTA, null, null, '+=0.01');
    }

    /***** TESTING *****/
    setTimeout(function() {
        showLabel('UP NEXT', 32);
    }, 500);

    setTimeout(function() {
        showMainLines('SAVE OR KILL THE ANIMALS IN SUPER METROID?', '1. SAVE THE ANIMALS - $18,940');
    }, 800);


    /*nodecg.listenFor('barDemand', function(data) {
        switch (data.type) {
            case 'bid':
                showBid(data, true);
                break;
            case 'prize':
                showPrize(data, true);
                break;
            default:
                throw new Error('Invalid barDemand type: ' + data.type);
        }
    }.bind(this));

    nodecg.listenFor('barCurrentBids', function() {
        showBids(true);
    }.bind(this));

    nodecg.listenFor('barCurrentPrizes', function() {
        showPrizes(true);
    }.bind(this));

    nodecg.listenFor('barUpNext', function() {
        showNext(true);
    }.bind(this));

    nodecg.listenFor('barCTA', function() {
        showCTA(true);
    }.bind(this));

    nodecg.listenFor('barGDQMonitor', function(message) {
        showGDQMonitor(message);
    }.bind(this));

    // Bids are the first thing we show, so we use this to start our loop
    showCTA();*/
});
