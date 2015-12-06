/* global define, requirejs, TimelineMax, TimelineLite, Power2, Power3 */
define([
    'preloader',
    'globals',
    'classes/stage',
    'debounce'
], function (preloader, globals, Stage, debounce) {
    'use strict';

    var MUSIC_NOTE_WIDTH = 34;
    var MUSIC_NOTE_HEIGHT = 45;
    var WIDTH = 396;
    var HEIGHT = 76;
    var NAME_RECT_HEIGHT = 35;
    var NAME_RECT_WIDTH = 331;

    var createjs = requirejs('easel');

    /**
     * Creates a new CompactNameplate instance.
     * @constructor
     * @extends createjs.Container
     */
    function CompactNameplate(index, alignment) {
        /* jshint -W106 */
        this.Container_constructor();
        this.setup(index, alignment);
        /* jshint +W106 */
    }

    var p = createjs.extend(CompactNameplate, createjs.Container);

    p.setup = function(index, alignment) {
        var stage = new Stage(WIDTH, 167); // Extra height to hit 256x257 minimum for hardware acceleration
        stage.canvas.style.left = '442px';
        stage.canvas.classList.add('nameplate', 'compact');

        /* ----- */

        this.coverMask = new createjs.Shape();
        this.coverMask.graphics.drawRect(0, 0, NAME_RECT_WIDTH, NAME_RECT_HEIGHT);

        this.cover1 = new createjs.Shape();
        this.cover1.graphics.beginFill('#6fd8ff');
        this.cover1Rect = this.cover1.graphics.drawRect(0, 0, 0, NAME_RECT_HEIGHT).command;
        this.cover1.mask = this.coverMask;

        this.cover2 = new createjs.Shape();
        this.cover2.graphics.beginFill('white');
        this.cover2Rect = this.cover2.graphics.drawRect(0, 0, 0 ,NAME_RECT_HEIGHT).command;
        this.cover2.mask = this.coverMask;

        /* ----- */

        this.nameBackground = new createjs.Shape();
        this.nameBackgroundFill = this.nameBackground.graphics.beginFill('#0072bc').command;
        this.nameBackground.graphics.drawRect(0, 0, NAME_RECT_WIDTH, NAME_RECT_HEIGHT);

        this.nameText = new createjs.Text('', '900 28px proxima-nova', 'white');
        this.nameText.y = 1;
        this.nameText.maxWidth = 308;

        /* ----- */

        this.twitchContainer = new createjs.Container();

        this.twitchBackground = new createjs.Shape();
        this.twitchBackground.graphics.beginFill('#985da6');
        this.twitchBackgroundRect = this.twitchBackground.graphics.drawRect(0, 0, 322, NAME_RECT_HEIGHT).command;
        this.twitchBackground.skewX = -10;

        this.twitchIcon = new createjs.Bitmap(preloader.getResult('nameplate-twitch-logo'));
        this.twitchIcon.y = 6;
        this.twitchIcon.scaleY = 23 / this.twitchIcon.getBounds().height;
        this.twitchIcon.scaleX = 23 / this.twitchIcon.getBounds().height;
        this.twitchIcon.mask = this.twitchBackground;

        this.twitchText = new createjs.Text('', '900 28px proxima-nova', 'white');
        this.twitchText.y = 1;
        this.twitchText.maxWidth = 270;

        this.twitchContainer.addChild(this.twitchBackground, this.twitchIcon, this.twitchText);

        /* ----- */

        this.timeText = new createjs.Text('0:00:00', '900 30px proxima-nova', 'white');
        this.timeText.y = 37;

        this.placeText = new createjs.Text('', '900 30px proxima-nova', '#fed206');
        this.placeText.y = this.timeText.y;

        /* ----- */

        this.musicNote = new createjs.Bitmap(preloader.getResult('nameplate-music-note'));
        this.musicNoteColorFilter = new createjs.ColorFilter(0,0,0);
        this.musicNote.filters = [this.musicNoteColorFilter];
        this.musicNote.alpha = 0.08;
        this.musicNote.cache(0, 0, MUSIC_NOTE_WIDTH, MUSIC_NOTE_HEIGHT);
        this.musicNote.y = 14;

        /* ----- */

        this.bottomBorder = new createjs.Shape();
        this.bottomBorder.y = HEIGHT;
        this.bottomBorderRect = this.bottomBorder.graphics.beginFill('white').drawRect(0, 0, WIDTH, 2).command;

        /* ----- */

        this.background = new createjs.Shape();
        this.backgroundFill = this.background.graphics.beginFill('#00AEEF').command;
        this.background.graphics.drawRect(0, 0, WIDTH, HEIGHT);

        this.addChild(this.background, this.nameBackground, this.nameText, this.timeText, this.placeText,
            this.twitchContainer, this.musicNote, this.bottomBorder, this.cover1, this.cover2);
        stage.addChild(this);

        /* ----- */

        if (alignment === 'right') {
            this.nameBackground.x = 65;

            this.nameText.textAlign = 'right';
            this.nameText.x = WIDTH - 5;

            this.twitchIcon.x = WIDTH - 30;

            this.twitchText.textAlign = 'right';
            this.twitchText.x = WIDTH- 38;

            this.twitchBackground.scaleX = -1;
            this.twitchBackground.x = WIDTH + 4;

            this.timeText.textAlign = 'right';
            this.timeText.x = this.nameText.x;

            this.placeText.textAlign = 'right';

            this.musicNote.x = 12;

            this.cover1.scaleX = -1;
            this.cover1.x = WIDTH;
            this.cover2.scaleX = -1;
            this.cover2.x = WIDTH;
            this.coverMask.scaleX = -1;
            this.coverMask.x = WIDTH;
        } else {
            this.nameText.x = 5;

            this.twitchIcon.x = 8;

            this.twitchText.x = 38;

            this.twitchBackground.x = -10;

            this.timeText.x = this.nameText.x;

            this.musicNote.x = 346;
        }

        /* ----- */

        var handleRunnerChange = debounce(function(name, stream) {
            var tl = new TimelineLite();

            tl.add('enter');

            tl.to(this.cover1Rect, 0.33, {
                w: NAME_RECT_WIDTH,
                ease: Power3.easeInOut,
                onComplete: function() {
                    this.nameText.text = name;
                    this.twitchText.text = stream;
                }.bind(this)
            }, 'enter');

            tl.to(this.cover2Rect, 0.77, {
                w: NAME_RECT_WIDTH,
                ease: Power3.easeInOut
            }, 'enter');

            tl.add('exit', '-=0.15');

            tl.to(this.cover2Rect, 0.33, {
                x: NAME_RECT_WIDTH,
                ease: Power3.easeInOut
            }, 'exit');

            tl.to(this.cover1Rect, 0.77, {
                x: NAME_RECT_WIDTH,
                ease: Power3.easeInOut
            }, 'exit');

            tl.call(function() {
                this.cover1Rect.x = 0;
                this.cover1Rect.w = 0;
                this.cover2Rect.x = 0;
                this.cover2Rect.w = 0;
            }, [], this);
        }.bind(this), 1500);

        globals.currentRunRep.on('change', function(oldVal, newVal) {
            var runner = newVal.runners[index];
            if (runner) {
                handleRunnerChange(runner.name, runner.stream);
            } else {
                handleRunnerChange('?', '?');
            }
        }.bind(this));

        globals.stopwatchesRep.on('change', function(oldVal, newVal) {
            var stopwatch = newVal[index];
            this.timeText.text = stopwatch.time;
            this.placeText.text = '';

            switch (stopwatch.state) {
                case 'paused':
                    break;
                case 'finished':
                    this.backgroundFill.style = '#60bb46';
                    this.nameBackgroundFill.style = '#3c9143';

                    switch (stopwatch.place) {
                        case 1:
                            this.placeText.text = '1st';
                            break;
                        case 2:
                            this.placeText.text = '2nd';
                            break;
                        case 3:
                            this.placeText.text = '3rd';
                            break;
                        case 4:
                            this.placeText.text = '4th';
                            break;
                        default:
                            throw new Error('[compact_nameplate] Unexpected stopwatch finish place: "'
                                + stopwatch.place + '"');
                    }

                    if (alignment === 'right') {
                        this.timeText.text = ' - ' + this.timeText.text;
                        this.placeText.x = this.timeText.x - this.timeText.getBounds().width;
                    } else {
                        this.timeText.text += ' - ';
                        this.placeText.x = this.timeText.x + this.timeText.getBounds().width;
                    }

                    break;
                default:
                    this.backgroundFill.style = '#00AEEF';
                    this.nameBackgroundFill.style = '#0072bc';
            }
        }.bind(this));

        /* ----- */

        var twitchHideX = alignment === 'right' ? 322 : -322;
        this.twitchContainer.x = twitchHideX;

        var tl = new TimelineMax({repeat: -1});

        tl.to({}, 29, {});

        tl.to(this.twitchContainer, 1.2, {
            x: 0,
            ease: Power2.easeInOut
        });

        tl.to(this.twitchContainer, 0.9, {
            x: twitchHideX,
            ease: Power2.easeIn
        }, '+=5');
    };

    p.configure = function(opts) {
        this.stage.canvas.style.top = opts.y + 'px';
        this.bottomBorder.visible = opts.bottomBorder;
    };

    p.disable = function() {
        this.stage.visible = false;
        this.stage.paused = true;
        this.stage.canvas.style.display = 'none';
    };

    p.enable = function() {
        this.stage.visible = true;
        this.stage.paused = false;
        this.stage.canvas.style.display = 'block';
    };

    return createjs.promote(CompactNameplate, 'Container');
});
