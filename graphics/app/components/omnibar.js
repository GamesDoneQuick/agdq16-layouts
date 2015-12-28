/* global define, requirejs, TweenLite, TimelineLite, Power3, Power2, Power1, Elastic, Back */
define([
    'preloader',
    'globals',
    'classes/stage',
    'layout',
    'numeral',
    'tabulate'
], function (preloader, globals, Stage, layout, numeral, tabulate) {
    'use strict';

    var OMNIBAR_HEIGHT = 55;
    var OMNIBAR_WIDTH_MINUS_LOGO = 1161;
    var CTA_VERT_SLIDE_TIME = 0.6;
    var WHITE = '#ffffff';
    var GRAY = '#efefef';
    var RED = '#d38585';
    var GREEN = '#a7d385';

    var createjs = requirejs('easel');
    var stage = new Stage(1280, OMNIBAR_HEIGHT, 'omnibar');
    stage.canvas.style.position = 'absolute';
    stage.canvas.style.bottom = '0px';
    stage.canvas.style.zIndex = '1';

    var omnibar = new createjs.Container();
    stage.addChild(omnibar);

    var tl = new TimelineLite({autoRemoveChildren: true});
    var state = {
        totalShowing: true,
        labelShowing: false
    };
    var lastShownGrandPrize;

    /* ----- */

    var gdqLogo = new createjs.Bitmap(preloader.getResult('omnibar-logo-gdq'));
    var GDQ_LOGO_WIDTH = gdqLogo.getBounds().width;

    var pcfLogo = new createjs.Bitmap(preloader.getResult('omnibar-logo-pcf'));
    var PCF_LOGO_WIDTH = pcfLogo.getBounds().width;
    pcfLogo.restingX = 1173;
    pcfLogo.x = pcfLogo.restingX;
    pcfLogo.y = -17;

    /* ----- */

    var barBg = new createjs.Shape();
    barBg.graphics
        .beginFill('#0075a1')
        .drawRect(GDQ_LOGO_WIDTH, 0, OMNIBAR_WIDTH_MINUS_LOGO, OMNIBAR_HEIGHT);
    barBg.cache(GDQ_LOGO_WIDTH, 0, OMNIBAR_WIDTH_MINUS_LOGO, OMNIBAR_HEIGHT);

    /* ----- */

    var CTA_CENTER_X = PCF_LOGO_WIDTH / 2 + 12;
    var CTA_TEXT_MASK_WIDTH = OMNIBAR_WIDTH_MINUS_LOGO / 2;

    var cta = new createjs.Container();
    cta.x = GDQ_LOGO_WIDTH + OMNIBAR_WIDTH_MINUS_LOGO / 2 - CTA_CENTER_X;
    cta.y = 10;

    var ctaLeftTextMask = new createjs.Shape();
    ctaLeftTextMask.graphics.drawRect(CTA_CENTER_X - CTA_TEXT_MASK_WIDTH, -cta.y, CTA_TEXT_MASK_WIDTH, OMNIBAR_HEIGHT);

    var ctaLeftText = new createjs.Text('', '800 32px proxima-nova', 'white');
    ctaLeftText.textAlign = 'right';
    ctaLeftText.restingX = 0;
    ctaLeftText.hiddenX = 383 + CTA_CENTER_X;
    ctaLeftText.x = ctaLeftText.hiddenX;
    ctaLeftText.mask = ctaLeftTextMask;
    ctaLeftText.snapToPixel = false;

    var ctaRightTextMask = new createjs.Shape();
    ctaRightTextMask.graphics.drawRect(CTA_CENTER_X, -cta.y, CTA_TEXT_MASK_WIDTH, OMNIBAR_HEIGHT);

    var ctaRightText = new createjs.Text('', '800 32px proxima-nova', 'white');
    ctaRightText.restingX = PCF_LOGO_WIDTH + 24;
    ctaRightText.hiddenX = -297 - CTA_CENTER_X;
    ctaRightText.x = ctaRightText.hiddenX;
    ctaRightText.mask = ctaRightTextMask;
    ctaRightText.snapToPixel = false;

    pcfLogo.ctaX = cta.x + 12;

    cta.addChild(ctaLeftTextMask, ctaRightTextMask, ctaLeftText, ctaRightText);

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
                alpha: 0,
                ease: Power1.easeInOut,
                onComplete: setLabelText,
                onCompleteParams: [text, size]
            });

            tmpTL.to(labelText, 0.25, {
                alpha: 1,
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

    function hideLabel() {
        var tmpTL = new TimelineLite();

        if (state.labelShowing) {
            var reverseLabelBgLayers = labelBgLayers.slice(0).reverse();
            tmpTL.staggerTo(reverseLabelBgLayers, 0.7, {
                onStart: function () {
                    state.labelShowing = false;
                },
                w: 0,
                ease: Back.easeIn.config(1.3)
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

    var _latestMainLine1 = {};
    function showMainLine1(text, color) {
        color = color || WHITE;

        if (text === _latestMainLine1.text && color === _latestMainLine1.color) {
            return;
        } else {
            _latestMainLine1.text = text;
            _latestMainLine1.color = color;
        }

        var tmpTL = new TimelineLite();

        if (mainLine1.text) {
            tmpTL.to(mainLine1, 0.5, {
                y: -20,
                ease: Power2.easeIn
            });

            // Delay for a sec
            tmpTL.to({}, 0.25, {});
        }

        tmpTL.call(function() {
            mainLine1.text = text;

            if (text) {
                mainLine1.x = mainLine1.restingX - mainLine1.getBounds().width - 20;
                mainLine1.y = mainLine1.restingY;
                mainLine1.color = color;
            }
        }, null, null, '+=0.01');


        if (text) {
            tmpTL.to(mainLine1, 1.2, {
                x: mainLine1.restingX,
                ease: Power2.easeOut
            });
        }

        return tmpTL;
    }

    var _latestMainLine2 = {};
    function showMainLine2(text, color) {
        color = color || WHITE;

        if (text === _latestMainLine2.text && color === _latestMainLine2.color) {
            return;
        } else {
            _latestMainLine2.text = text;
            _latestMainLine2.color = color;
        }

        var tmpTL = new TimelineLite();

        if (mainLine2.text) {
            tmpTL.to(mainLine2, 0.5, {
                y: 50,
                ease: Power2.easeIn
            });

            // Delay for a sec
            tmpTL.to({}, 0.25, {});
        }

        tmpTL.call(function() {
            mainLine2.text = text;

            if (text) {
                mainLine2.x = mainLine2.restingX - mainLine2.getBounds().width - 20;
                mainLine2.y = mainLine2.restingY;
                mainLine2.color = color;
            }
        }, null, null, '+=0.01');

        if (text) {
            tmpTL.to(mainLine2, 1.2, {
                x: mainLine2.restingX,
                ease: Power2.easeOut
            });
        }

        return tmpTL;
    }

    /* ----- */

    var totalContainer = new createjs.Container();

    var totalLeftBorder = new createjs.Shape();
    totalLeftBorder.graphics.beginFill('white').drawRect(0, 0, 3, OMNIBAR_HEIGHT);

    var totalText = new createjs.Text('', '800 30px proxima-nova', 'white');
    totalText.rawValue = 0;
    totalText.x = 13;
    totalText.y = 10;

    totalContainer.addChild(totalLeftBorder, totalText);

    globals.totalRep.on('change', function(oldVal, newVal) {
        var TIME_PER_DOLLAR = 0.03;
        var delta = newVal.raw - totalText.rawValue;
        var duration = Math.min(delta * TIME_PER_DOLLAR, 5);
        TweenLite.to(totalText, duration, {
            rawValue: newVal.raw,
            ease: Power2.easeOut,
            onUpdate: function() {
                var formattedTotal = numeral(totalText.rawValue).format('$0,0');
                totalText.text =  tabulate(formattedTotal);

                var totalContainerWidth = totalContainer.getBounds().width;
                totalContainer.showingX = OMNIBAR_WIDTH_MINUS_LOGO - totalContainerWidth - PCF_LOGO_WIDTH - 36;
                totalContainer.hiddenX = totalContainer.showingX + OMNIBAR_WIDTH_MINUS_LOGO - totalContainer.showingX;

                totalContainer.x = state.totalShowing ? totalContainer.showingX : totalContainer.hiddenX;

                mainLine1.maxWidth = totalContainer.showingX - mainLine1.x - 12;
                mainLine2.maxWidth = mainLine1.maxWidth - 4;
            }
        });
    });

    function showTotal() {
        var tmpTL = new TimelineLite();

        if (!state.totalShowing) {
            tmpTL.call(function() {
                TweenLite.to(totalContainer, 0.7, {
                    onStart: function () {
                        state.totalShowing = true;
                    },
                    x: totalContainer.showingX,
                    ease: Power2.easeOut
                });
            }, null, null, '+=0.01');

            tmpTL.to({}, 0.7, {});
        }

        return tmpTL;
    }

    function hideTotal() {
        var tmpTL = new TimelineLite();

        if (state.totalShowing) {
            tmpTL.call(function() {
                TweenLite.to(totalContainer, 0.7, {
                    onStart: function () {
                        state.totalShowing = false;
                    },
                    x: totalContainer.hiddenX,
                    ease: Power2.easeIn
                });
            }, null, null, '+=0.01');

            tmpTL.to({}, 0.7, {});
        }

        return tmpTL;
    }

    /* ----- */

    // This is what holds the "Up Next", "Bid War", and "Raffle Prizes" modes.
    var mainContainer = new createjs.Container();
    mainContainer.x = GDQ_LOGO_WIDTH;
    mainContainer.addChild(mainLine1, mainLine2, labelBg, labelText, totalContainer);

    omnibar.addChild(barBg, mainContainer, cta, gdqLogo, pcfLogo);

    /* ----- */

    function showCTA(immediate) {
        if (immediate) tl.clear();

        tl.call(function() {
            hideLabel();
            hideTotal();
        }, null, null, '+=0.01');

        // Move PCF logo to center
        tl.to(pcfLogo, 1.2, {
            onStart: function() {
                ctaLeftText.text = '#AGDQ2016 benefits the';
                ctaRightText.text = 'Prevent Cancer Foundation';
            },
            x: pcfLogo.ctaX,
            ease: Power3.easeInOut
        });

        // Enter Line 1
        tl
            .add('showCTA_Line1Enter')
            .to(ctaLeftText, CTA_VERT_SLIDE_TIME, {
                x: ctaLeftText.restingX,
                ease: Power2.easeOut
            }, 'showCTA_Line1Enter')
            .to(ctaRightText, CTA_VERT_SLIDE_TIME, {
                x: ctaRightText.restingX,
                ease: Power2.easeOut
            }, 'showCTA_Line1Enter');

        // Exit Line 1
        tl
            .add('showCTA_Line1Exit', '+=' + globals.displayDuration)
            .to(ctaLeftText, CTA_VERT_SLIDE_TIME, {
                y: -40,
                ease: Power2.easeIn
            }, 'showCTA_Line1Exit')
            .to(ctaRightText, CTA_VERT_SLIDE_TIME, {
                y: 38,
                ease: Power2.easeIn,
                onComplete: function() {
                    ctaLeftText.y = 38;
                    ctaRightText.y = -40;
                    ctaLeftText.text = 'Donate to PCF at';
                    ctaRightText.text = 'gamesdonequick.com';
                }
            }, 'showCTA_Line1Exit');

        // Enter Line 2
        tl
            .add('showCTA_Line2Enter')
            .to(ctaLeftText, CTA_VERT_SLIDE_TIME, {
                y: 0,
                ease: Power2.easeOut
            }, 'showCTA_Line2Enter')
            .to(ctaRightText, CTA_VERT_SLIDE_TIME, {
                y: 0,
                ease: Power2.easeOut
            }, 'showCTA_Line2Enter');

        // Exit Line 2
        tl
            .add('showCTA_Line2Exit', '+=' + globals.displayDuration)
            .to(ctaLeftText, CTA_VERT_SLIDE_TIME, {
                x: ctaLeftText.hiddenX,
                ease: Power2.easeIn
            }, 'showCTA_Line2Exit')
            .to(ctaRightText, CTA_VERT_SLIDE_TIME, {
                x: ctaRightText.hiddenX,
                ease: Power2.easeIn
            }, 'showCTA_Line2Exit');

        tl.add('showCTA_end');

        // Move PCF Logo back to far right
        tl.to(pcfLogo, 1.2, {
            x: pcfLogo.restingX,
            ease: Power3.easeInOut
        }, 'showCTA_end');

        tl.call(function() {
            showTotal();
            showCurrentBids();
        }, null, null, 'showCTA_end+=0.3');
    }

    function showUpNext(immediate) {
        var upNextRun = layout.currentLayoutName === 'break' ? globals.currentRun : globals.nextRun;

        if (upNextRun) {
            if (immediate) tl.clear();

            tl.to({}, 0.3, {
                onStart: function() {
                    showLabel('UP NEXT', 32);
                }
            });

            // GSAP is dumb with `call` sometimes. Putting this in a near-zero duration tween seems to be more reliable.
            tl.to({}, 0.01, {
                onComplete: function() {
                    /* Depending on how we enter the very end of the schedule, we might end up in this func
                     * after window.nextRun has been set to null. In that case, we immediately clear the
                     * timeline and bail out to showing bids again.
                     */
                    var upNextRun = layout.currentLayoutName === 'break' ? globals.currentRun : globals.nextRun;
                    if (upNextRun) {
                        showMainLine1(upNextRun.concatenatedRunners);
                        showMainLine2(upNextRun.name.replace('\\n', ' ').trim() + ' - ' + upNextRun.category);
                    } else {
                        tl.clear();

                        tl.to({}, 0.3, {
                            onStart: function() {
                                showMainLine1('');
                                showMainLine2('');
                            },
                            onComplete: showCurrentBids
                        });
                    }
                }
            });

            // Give it some time to show
            tl.to({}, globals.displayDuration, {});
        }

        tl.to({}, 0.3, {
            onStart: function() {
                showMainLine1('');
                showMainLine2('');
            },
            onComplete: showCTA
        });
    }

    function showCurrentBids(immediate) {
        if (immediate) tl.clear();

        if (globals.currentBids.length > 0) {
            var showedLabel = false;

            // Figure out what bids to display in this batch
            var bidsToDisplay = [];

            globals.currentBids.forEach(function(bid) {
                // Don't show closed bids in the automatic rotation.
                if (bid.state.toLowerCase() === 'closed') return;

                // We have at least one bid to show, so show the label
                if (!showedLabel) {
                    showedLabel = true;
                    tl.to({}, 0.3, {
                        onStart: function() {
                            showLabel('BID WAR', 33);
                        }
                    });
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

        tl.to({}, 0.3, {
            onStart: function() {
                showMainLine1('');
                showMainLine2('');
            },
            onComplete: showCurrentPrizes
        });
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
        tl.to({}, globals.displayDuration, {});

        // If we're just showing this one bid on-demand, show "Prizes" next.
        if (immediate) {
            tl.to({}, 0.3, {
                onStart: function() {
                    showMainLine1('');
                    showMainLine2('');
                },
                onComplete: showCurrentPrizes
            });
        }
    }

    function showCurrentPrizes(immediate) {
        if (immediate) tl.clear();

        if (globals.currentGrandPrizes.length > 0 || globals.currentNormalPrizes.length > 0) {
            var prizesToDisplay = globals.currentNormalPrizes.slice(0);
            tl.to({}, 0.3, {
                onStart: function() {
                    showLabel('RAFFLE\nPRIZES', 30);
                }
            });

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
            prizesToDisplay.forEach(function(prize) {
                showPrize(prize);
            });
        }

        tl.to({}, 0.3, {
            onStart: function() {
                showMainLine1('');
                showMainLine2('');
            },
            onComplete: showUpNext
        });
    }

    function showPrize(prize, immediate) {
        if (immediate) {
            tl.clear();
            tl.call(showLabel, ['RAFFLE\nPRIZES', 30], null, '+=0.01');
        }

        // GSAP is dumb with `call` sometimes. Putting this in a near-zero duration tween seems to be more reliable.
        tl.to({}, 0.01, {
            onComplete: function() {
                showMainLine1('Provided by ' + prize.provided);

                if (prize.grand) {
                    showMainLine2('Grand Prize: ' + prize.name + ' (Minimum Bid: ' + prize.minimumbid + ')');
                } else {
                    showMainLine2(prize.name + ' (Minimum Bid: ' + prize.minimumbid + ')');
                }
            }
        });

        // Give the prize some time to show
        tl.to({}, globals.displayDuration, {});

        // If we're just showing this one prize on-demand, show "Up Next" next.
        if (immediate) {
            tl.to({}, 0.3, {
                onStart: function() {
                    showMainLine1('');
                    showMainLine2('');
                },
                onComplete: showUpNext
            });
        }
    }

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
    });

    nodecg.listenFor('barCurrentBids', function() {
        showCurrentBids(true);
    });

    nodecg.listenFor('barCurrentPrizes', function() {
        showCurrentPrizes(true);
    });

    nodecg.listenFor('barUpNext', function() {
        showUpNext(true);
    });

    nodecg.listenFor('barCTA', function() {
        showCTA(true);
    });

    //nodecg.listenFor('barGDQMonitor', showGDQMonitor);

    // CTA is the first thing we show, so we use this to start our loop
    showCTA();
});
