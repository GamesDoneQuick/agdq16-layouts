/* global define, requirejs, TimelineLite, Elastic, Back */
define([
    'debug',
    'classes/stage',
    'components/background',
    'components/speedrun',
    'components/nameplates',
    'globals'
], function(debug, Stage, setBackground, speedrun, nameplates, globals) {
    'use strict';

    var LAYOUT_NAME = 'interview';
    var STAGE_WIDTH = 1280;
    var STAGE_HEIGHT = 100;
    var PADDING = 37;

    var sponsorsAndTwitter = document.getElementById('sponsorsAndTwitter');
    var sponsorDisplay = document.querySelector('sponsor-display');
    var twitterDisplay = document.querySelector('twitter-display');

    var createjs = requirejs('easel');
    var stage = new Stage(STAGE_WIDTH, STAGE_HEIGHT, 'interview-lowerthird');
    stage.canvas.style.top = '502px';
    stage.canvas.style.left = '0px';

    // Start hidden
    stage.visible = false;
    stage.paused = true;
    stage.canvas.style.display = 'none';

    /* ----- */

    var background = new createjs.Shape();
    background.y = STAGE_HEIGHT / 2;
    stage.addChild(background);

    var backgroundLayer4 = background.graphics.beginFill('#0075a1').drawRect(0, 0, STAGE_WIDTH, 0).command;
    backgroundLayer4.targetHeight = 74;

    var backgroundLayer3 = background.graphics.beginFill('#00aeef').drawRect(0, 0, STAGE_WIDTH, 0).command;
    backgroundLayer3.targetHeight = 66;

    var backgroundLayer2 = background.graphics.beginFill('#0075a1').drawRect(0, 0, STAGE_WIDTH, 0).command;
    backgroundLayer2.targetHeight = 62;

    var backgroundLayer1 = background.graphics.beginFill('#00aeef').drawRect(0, 0, STAGE_WIDTH, 0).command;
    backgroundLayer1.targetHeight = 58;

    var backgroundLayers = [backgroundLayer1, backgroundLayer2, backgroundLayer3, backgroundLayer4];
    var reverseBackgroundLayers = backgroundLayers.slice(0).reverse();

    /* ----- */

    var textContainer = new createjs.Container();
    textContainer.y = 36;
    textContainer.mask = background;
    stage.addChild(textContainer);

    var nameText1 = new createjs.Text('', '800 25px proxima-nova', 'white');
    var nameText2 = new createjs.Text('', '800 25px proxima-nova', 'white');
    var nameText3 = new createjs.Text('', '800 25px proxima-nova', 'white');
    var nameText4 = new createjs.Text('', '800 25px proxima-nova', 'white');

    nameText1.textAlign = 'center';
    nameText2.textAlign = 'center';
    nameText3.textAlign = 'center';
    nameText4.textAlign = 'center';

    textContainer.addChild(nameText1, nameText2, nameText3, nameText4);

    /* ----- */

    var interviewNames = nodecg.Replicant('interviewNames');
    var tl = new TimelineLite({autoRemoveChildren: true});

    nodecg.Replicant('interviewLowerthirdShowing').on('change', function(oldVal, newVal) {
        if (newVal) {
            tl.call(function() {
                var names = interviewNames.value;
                var numNames = names.filter(function(s) {return !!s;}).length;
                var maxWidth = (STAGE_WIDTH / numNames) - (PADDING * 2);
                nameText1.maxWidth = maxWidth;
                nameText2.maxWidth = maxWidth;
                nameText3.maxWidth = maxWidth;
                nameText4.maxWidth = maxWidth;

                nameText1.text = names[0] ? names[0].toUpperCase() : '';
                nameText2.text = names[1] ? names[1].toUpperCase() : '';
                nameText3.text = names[2] ? names[2].toUpperCase() : '';
                nameText4.text = names[3] ? names[3].toUpperCase() : '';

                var widthUnit = STAGE_WIDTH / numNames;
                names.forEach(function(name, index){
                    textContainer.children[index].x = (widthUnit * index) + (widthUnit / 2);
                });
            }, null, null, '+=0.1');

            tl.add('entry');

            reverseBackgroundLayers.forEach(function(rect, index) {
                tl.to(rect, 1, {
                    h: rect.targetHeight,
                    roundProps: index === 0 ? 'h' : '', // Round the outermost rect
                    ease: Elastic.easeOut.config(0.5, 0.5),
                    onStart: function() {
                        if (index === 0) {
                            debug.time('interviewEnter');
                        }
                    },
                    onUpdate: function() {
                        // Round the outermost rect to avoid half pixels which can't be cleanly chroma keyed
                        rect.y = index === 0 ? -Math.round(rect.h / 2) : -(rect.h / 2);
                    },
                    onComplete: function() {
                        if (index === 3) {
                            debug.timeEnd('interviewEnter');
                        }
                    }
                }, 'entry+=' + (index * 0.08));
            });
        }

        else {
            tl.add('exit');

            backgroundLayers.forEach(function(rect, index) {
                tl.to(rect, 1, {
                    h: 0,
                    roundProps: index === 3 ? 'h' : '',
                    ease: Back.easeIn.config(1.3),
                    onStart: function() {
                        if (index === 0) {
                            debug.time('interviewExit');
                        }
                    },
                    onUpdate: function() {
                        rect.y = index === 3 ? -Math.round(rect.h / 2) : -(rect.h / 2);
                    },
                    onComplete: function() {
                        if (index === 3) {
                            debug.timeEnd('interviewExit');
                        }
                    }
                }, 'exit+=' + (index * 0.08));
            });
        }
    });

    return {
        attached: function() {
            setBackground(LAYOUT_NAME);
            speedrun.disable();
            nameplates.disable();
            stage.visible = true;
            stage.paused = false;
            stage.canvas.style.display = 'block';

            sponsorsAndTwitter.style.top = '479px';
            sponsorsAndTwitter.style.left = '387px';
            sponsorsAndTwitter.style.width = '516px';
            sponsorsAndTwitter.style.height = '146px';

            sponsorDisplay.style.display = 'none';

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
            sponsorDisplay.style.display = 'block';
        }
    };
});
