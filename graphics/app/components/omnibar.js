/* global define, TimelineLite, Power2, Power1, Elastic */
define([
    'preloader',
    'globals',
    'classes/stage'
], function (preloader, globals, Stage) {
    'use strict';

    var OMNIBAR_HEIGHT = 55;
    var OMNIBAR_WIDTH_MINUS_LOGO = 1161;
    var WHITE = '#ffffff';
    var GRAY = '#efefef';
    var RED = '#d38585';
    var GREEN = '#a7d385';

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
    var lastShownGrandPrize;

    /* ----- */

    var gdqLogo = new createjs.Bitmap(preloader.getResult('omnibar-logo-gdq'));
    var GDQ_LOGO_WIDTH = gdqLogo.getBounds().width;

    /* ----- */

    var barBg = new createjs.Shape();
    barBg.graphics
        .beginFill('#0075a1')
        .drawRect(GDQ_LOGO_WIDTH, 0, OMNIBAR_WIDTH_MINUS_LOGO, OMNIBAR_HEIGHT);
    barBg.cache(GDQ_LOGO_WIDTH, 0, OMNIBAR_WIDTH_MINUS_LOGO, OMNIBAR_HEIGHT);


    /* ----- */

    var cta = new createjs.Container();
    cta.x = GDQ_LOGO_WIDTH;

    var ctaText = new createjs.Text('FOKKEN DONATE, YE? GWAN.', '800 48px proxima-nova', 'white');
    ctaText.textAlign = 'center';

    cta.addChild(ctaText);

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

    function showMainLine1(text, color) {
        var tmpTL = new TimelineLite();
        color = color || WHITE;

        if (mainLine1.text) {
            tmpTL.add('exit');

            tmpTL.to(mainLine1, 0.5, {
                y: -18,
                ease: Power2.easeIn
            }, 'exit');
        }

        tmpTL.add('enter');

        tmpTL.to(mainLine1, 1.2, {
            onStart: function() {
                mainLine1.text = text;
                mainLine1.x = mainLine1.restingX - mainLine1.getBounds().width - 20;
                mainLine1.y = mainLine1.restingY;
                mainLine1.color = color;
            },
            x: mainLine1.restingX,
            ease: Power2.easeOut
        }, 'enter');

        return tmpTL;
    }

    function showMainLine2(text, color) {
        var tmpTL = new TimelineLite();
        color = color || WHITE;

        if (mainLine2.text) {
            tmpTL.add('exit');

            tmpTL.to(mainLine2, 0.5, {
                y: 50,
                ease: Power2.easeIn
            }, 'exit');
        }

        tmpTL.add('enter');

        tmpTL.to(mainLine2, 1.2, {
            onStart: function() {
                mainLine2.text = text;
                mainLine2.x = mainLine2.restingX - mainLine2.getBounds().width - 20;
                mainLine2.y = mainLine2.restingY;
                mainLine2.color = color;
            },
            x: mainLine2.restingX,
            ease: Power2.easeOut
        }, 'enter');

        return tmpTL;
    }

    /* ----- */

    var totalContainer = new createjs.Container();

    var totalLeftBorder = new createjs.Shape();
    totalLeftBorder.graphics.beginFill('white').drawRect(0, 0, 3, OMNIBAR_HEIGHT);

    var totalText = new createjs.Text('', '800 30px proxima-nova', 'white');
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
        ctaText.maxWidth = totalContainer.x - 24;
        ctaText.x = ctaText.maxWidth / 2 + 12;
    });

    /* ----- */

    // This is what holds the "Up Next", "Bid War", and "Raffle Prizes" modes.
    var mainContainer = new createjs.Container();
    mainContainer.x = GDQ_LOGO_WIDTH;
    mainContainer.addChild(mainLine1, mainLine2, labelBg, labelText, totalContainer);

    omnibar.addChild(barBg, mainContainer, cta, gdqLogo);

    /* ----- */

    function showCTA(immediate) {
        if (immediate) tl.clear();

        tl.add('showCTA_start');
        tl.add(this._hideLabel(), 'showCTA_start');

        tl.call(function() {
            var b = document.createElement('b');
            b.textContent = 'Call-to-action line #2';

            // Put it in the qPlate hopper.
            self.$.fullLine.fillHopper(b);
        }, null, null, '+=' + displayDuration);

        // Give it some time to show
        tl.to({}, displayDuration, {});

        // Hide, then show bids
        tl.to({}, this.$.fullLine.duration / 2, {
            onStart: function() {
                self.$.fullLine.fillHopperText('');
            },
            onComplete: function() {
                self.$.fullLine.style.display = 'none';
                self.showBids();
            }
        })
    }

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
                        var runnerNames = globals.nextRun.runners.reduce(function(prev, curr) {
                            return prev + ', ' + curr.name;
                        });
                        showMainLine1(runnerNames);
                        showMainLine2(globals.nextRun.game + ' - ' + globals.nextRun.category);
                    } else {
                        tl.clear();
                        tl.call(showCurrentBids);
                    }
                }
            });

            // Give it some time to show
            tl.to({}, displayDuration, {});
        }

        tl.call(showCTA, null, null, '+=0.01');
    }

    function showCurrentBids(immediate) {
        if (immediate) tl.clear();

        if (globals.currentBids.length > 0) {
            var showedLabel = false;

            // Figure out what bids to display in this batch
            var bidsToDisplay = [];

            window.currentBids.forEach(function(bid) {
                // Don't show closed bids in the automatic rotation.
                if (bid.state.toLowerCase() === 'closed') return;

                // We have at least one bid to show, so show the label
                if (!showedLabel) {
                    showedLabel = true;
                    tl.call(showLabel, ['BID WAR', 33]);
                }

                // If we have already have our three bids determined, we still need to check
                // if any of the remaining bids are for the same speedrun as the third bid.
                // This ensures that we are never displaying a partial list of bids for a given speedrun.
                if (bidsToDisplay.length < 3) {
                    bidsToDisplay.push(bid);
                } else if (bid.speedrun === bidsToDisplay[bidsToDisplay.length - 1].speedrun) {
                    bidsToDisplay.push(bid);
                }
            });

            // Loop over each bid and queue it up on the timeline
            bidsToDisplay.forEach(function(bid) {
                showBid(bid);
            });
        }

        tl.call(showPrizes, null, null, '+=0.01');
    }

    function showBid(bid, immediate) {
        if (immediate) {
            tl.clear();
            tl.call(showLabel, ['BID WAR', 33]);
        }

        var mainLine1Text = bid.description;
        var mainLine1Color = WHITE;

        // If this bid is closed, we want the text to default to gray.
        if (bid.state.toLowerCase() === 'closed') {
            mainLine1Text += ' (CLOSED)';
            mainLine1Color = GRAY;
        }

        // GSAP is dumb with `call` sometimes. Putting this in a near-zero duration tween seems to be more reliable.
        tl.to({}, 0.01, {
            onComplete: function() {
                showMainLine1(mainLine1Text, mainLine1Color);
            }
        });

        // If this is a donation war, up to three options for it.
        // Else, it must be a normal incentive, so show its total amount raised and its goal.
        if (bid.options) {
            // If there are no options yet, display a message.
            if (bid.options.length === 0) {
                tl.call(function() {
                    showMainLine2('Be the first to bid!');
                }, null, null);
            }

            else {
                bid.options.forEach(function(option, index) {
                    if (index > 2) return;

                    tl.call(function() {
                        // If this bid is closed, the first option (the winner)
                        // should be green and the rest should be red.
                        var mainLine2Color = WHITE;
                        if (bid.state.toLowerCase() === 'closed') {
                            if (index === 0) {
                                mainLine2Color = GREEN;
                            } else {
                                mainLine2Color = RED;
                            }
                        }

                        var mainLine2Text = (index + 1) + '. ' + (option.description || option.name)
                            + ' - ' + option.total;
                        showMainLine2(mainLine2Text, mainLine2Color);
                    }, null, null, '+=' + (0.08 + (index * 4)));
                });
            }
        }

        else {
            tl.call(function() {
                var mainLine2Color = bid.state.toLowerCase() === 'closed' ? GRAY : WHITE;
                showMainLine2(bid.total + ' / ' + bid.goal, mainLine2Color);
            }, null, null, '+=0.08');
        }

        // Give the bid some time to show
        tl.to({}, displayDuration, {});

        // If we're just showing this one bid on-demand, show "Prizes" next.
        if (immediate) {
            tl.call(showCurrentPrizes, null, null, '+=0.01');
        }
    }

    function showCurrentPrizes(immediate) {
        if (immediate) tl.clear();

        if (globals.currentGrandPrizes.length > 0 || globals.currentNormalPrizes.length > 0) {
            var prizesToDisplay = globals.currentNormalPrizes.slice(0);
            tl.call(showLabel, ['RAFFLE\nPRIZES', 30]);

            if (globals.currentGrandPrizes.length) {
                // Figure out what grand prize to show in this batch.
                var lastShownGrandPrizeIdx = globals.currentGrandPrizes.indexOf(lastShownGrandPrize);
                var nextGrandPrizeIdx = lastShownGrandPrizeIdx >= globals.currentGrandPrizes.length - 1
                    ? 0
                    : lastShownGrandPrizeIdx + 1;
                var nextGrandPrize = globals.currentGrandPrizes[nextGrandPrizeIdx];

                if (nextGrandPrize) {
                    prizesToDisplay.unshift(nextGrandPrize);
                    lastShownGrandPrize = nextGrandPrize;
                }
            }

            // Loop over each prize and queue it up on the timeline
            prizesToDisplay.forEach(showPrize);
        }

        tl.call(showNext, null, null, '+=0.01');
    }

    function showPrize(prize, immediate) {
        if (immediate) {
            tl.clear();
            tl.call(showLabel, ['RAFFLE\nPRIZES', 30]);
        }

        // GSAP is dumb with `call` sometimes. Putting this in a near-zero duration tween seems to be more reliable.
        tl.to({}, 0.01, {
            onComplete: function() {
                showMainLine1('PROVIDED BY ' + prize.provided);

                if (prize.grand) {
                    showMainLine2('Grand Prize: ' + prize.name + ' (Minimum Bid: ' + prize.minimumbid + ')');
                } else {
                    showMainLine2(prize.name + ' (Minimum Bid: ' + prize.minimumbid + ')');
                }
            }
        });

        // Give the prize some time to show
        tl.to({}, displayDuration, {});

        // If we're just showing this one prize on-demand, show "Up Next" next.
        if (immediate) {
            tl.call(showUpNext, null, null, '+=0.01');
        }
    }

    /***** TESTING *****/
    setTimeout(function() {
        showUpNext('UP NEXT', 32);
    }, 500);

    nodecg.listenFor('barDemand', function(data) {
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
        showCurrentBids(true);
    }.bind(this));

    nodecg.listenFor('barCurrentPrizes', function() {
        showCurrentPrizes(true);
    }.bind(this));

    nodecg.listenFor('barUpNext', function() {
        showUpNext(true);
    }.bind(this));

    nodecg.listenFor('barCTA', function() {
        showCTA(true);
    }.bind(this));

    nodecg.listenFor('barGDQMonitor', function(message) {
        showGDQMonitor(message);
    }.bind(this));

    // CTA is the first thing we show, so we use this to start our loop
    showCTA();
});
