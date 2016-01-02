/* global requirejs, TimelineLite, TweenLite, Polymer, Power3, Power2, Power1 */
/* jshint -W106 */
requirejs(['debug'], function(debug) {
    'use strict';

    var BODY_DISPLAY_DURATION = 7;
    var BASE_IMAGE_DURATION = 5;
    var MIN_BOTTOM_BODY_MARGIN = 28;
    var imgPreloaderEl = document.createElement('img');

    function oneTime(target, type, callback) {
        var listener = function(e) {
            callback(e);
            e.target.removeEventListener(type, listener);
        };
        target.addEventListener(type, listener);
    }

    /* jshint -W064 */
    Polymer({
    /* jshint +W064 */

        is: 'twitter-display',

        properties: {
            bodyStyle: {
                type: Object,
                observer: '_bodyStyleChanged'
            },
            namebarStyle: {
                type: Object,
                observer: '_namebarStyleChanged'
            }
        },

        ready: function () {
            this._width = 0;
            var self = this;

            var background = this.$.background;
            var backgroundX = '-100%';
            var backgroundProxy = {};
            Object.defineProperty(backgroundProxy, 'x', {
                set: function (newVal) {
                    var percentage = parseFloat(newVal) / 100;
                    backgroundX = newVal;
                    TweenLite.set(background, {
                        x: Math.round(self._width * percentage)
                    });
                },
                get: function() {
                    return backgroundX;
                }
            });

            var selfX = '0%';
            var selfProxy = {};
            Object.defineProperty(selfProxy, 'x', {
                set: function (newVal) {
                    var percentage = parseFloat(newVal) / 100;
                    selfX = newVal;
                    TweenLite.set(self, {
                        x: Math.round(self._width * percentage)
                    });
                },
                get: function() {
                    return selfX;
                }
            });

            var tl = new TimelineLite({
                autoRemoveChilren: true,
                onComplete: function() {
                    // Remove will-change every time the timeline is emptied
                    self.$.background.style.willChange = '';
                    self.$.image.style.willChange = '';
                    self.$.namebar.style.willChange = '';
                    self.$.body.style.willChange = '';
                    self.style.willChange = '';
                }.bind(this)
            });

            nodecg.listenFor('showTweet', function (tweet) {
                // Set will-change on all the elements we're about to animate.
                this.$.background.style.willChange = 'transform';
                this.$.image.style.willChange = 'opacity';
                this.$.namebar.style.willChange = 'transform';
                this.$.body.style.willChange = 'opacity, transform';
                this.style.willChange = 'transform';

                // Reset
                tl.set(this, {visibility: 'visible'});
                tl.set(selfProxy, {x: '0%'});
                tl.set(backgroundProxy, {x: '-100%'});
                tl.set(self.$.namebar, {x: '100%'});
                tl.set(self.$.body, {opacity: 0, y: '-5%'});

                tl.to(backgroundProxy, 1, {
                    onStart: function () {
                        this.$.body.fontSize = this.bodyStyle.fontSize + 'px';
                        this.$.body.innerHTML = tweet.text;
                        this.$.username.innerText = '@' + tweet.user.screen_name;
                        this.scaleDownBodyIfNecessary();
                    }.bind(this),
                    x: '0%',
                    ease: Power3.easeInOut
                }, '+=0.2'); // Small delay to give `will-change` time to do its optimizations.

                // If this tweet has pictures...
                if (tweet.imageUrls && tweet.imageUrls.length > 0) {
                    var imageDuration = BASE_IMAGE_DURATION - tweet.imageUrls.length * 0.5;
                    tweet.imageUrls.forEach(function(url) {
                        tl.call(function () {
                            imgPreloaderEl.src = url;
                            if (imgPreloaderEl.complete) {
                                self.$.image.src = url;
                            } else {
                                tl.pause();
                                oneTime(imgPreloaderEl, 'load', function () {
                                    self.$.image.src = url;
                                    tl.resume();
                                });
                            }
                        });

                        tl.to(this.$.image, 1, {
                            onStart: function() {
                                debug.time('tweetImageFadeIn');
                            },
                            opacity: 1,
                            ease: Power1.easeInOut,
                            onComplete: function() {
                                debug.timeEnd('tweetImageFadeIn');
                            }
                        });

                        tl.to(this.$.image, 1, {
                            onStart: function() {
                                debug.time('tweetImageFadeOut');
                            },
                            opacity: 0,
                            ease: Power1.easeInOut,
                            onComplete: function() {
                                debug.timeEnd('tweetImageFadeOut');
                            }
                        }, '+=' + imageDuration);
                    }.bind(this));
                }

                tl.to(this.$.namebar, 0.7, {
                    x: '0%',
                    ease: Power2.easeOut
                }, '-=0.1');

                tl.to(this.$.body, 0.6, {
                    y: '0%',
                    opacity: 1,
                    ease: Power1.easeOut
                }, '-=0.25');

                tl.to(selfProxy, 1, {
                    x: '100%',
                    ease: Power2.easeIn
                }, '+=' + BODY_DISPLAY_DURATION);

                tl.set(this, {visibility: 'hidden'});

                // Padding
                tl.to({}, 0.1, {});
            }.bind(this));
        },

        _bodyStyleChanged: function (newVal) {
            // A bit of a hack, but recalc backgroundWidth whenever the body style is changed.
            this._width = this.getBoundingClientRect().width;

            var bodyEl = this.$.body;
            bodyEl.style.top = newVal.top + 'px';
            bodyEl.style.fontSize = newVal.fontSize + 'px';
            bodyEl.style.marginLeft = newVal.horizontalMargin + 'px';
            bodyEl.style.marginRight = newVal.horizontalMargin + 'px';
            this.async(this.scaleDownBodyIfNecessary);
        },

        _namebarStyleChanged: function (newVal) {
            var namebarEl = this.$.namebar;
            namebarEl.style.top = newVal.top + 'px';
            namebarEl.style.width = newVal.width + 'px';
            namebarEl.style.fontSize = newVal.fontSize + 'px';
        },

        scaleDownBodyIfNecessary: function() {
            if (!this.$.body.innerHTML
                || !this.bodyStyle
                || !this.bodyStyle.top) {
                return;
            }

            // If the body is too close to the namebar, shrink the body's font size until it isn't
            while (this.$.body.getBoundingClientRect().bottom + MIN_BOTTOM_BODY_MARGIN
                    > this.$.namebar.getBoundingClientRect().top) {
                var currentFontSize = parseInt(this.$.body.style.fontSize);
                this.$.body.style.fontSize = (currentFontSize-1) + 'px';
            }
        }
    });
});
