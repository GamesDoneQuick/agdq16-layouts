/* global requirejs, Polymer, TimelineLite, TweenLite, Power1 */
requirejs(['debug'], function(debug) {
    'use strict';

    var FADE_DURATION = 1;
    var FADE_EASE = Power1.easeInOut;
    var HOLD_DURATION = 20;

    function oneTime(target, type, callback) {
        if (target.loaded) {
            callback();
        } else {
            var listener = function(e) {
                callback(e);
                e.target.removeEventListener(type, listener);
            };
            target.addEventListener(type, listener);
        }
    }

    /* jshint -W064 */
    Polymer({
    /* jshint +W064 */

        is: 'sponsor-display',

        properties: {
            orientation: {
                type: String,
                value: 'horizontal',
                reflectToAttribute: true,
                observer: '_orientationChanged'
            }
        },

        _orientationChanged: function(newVal) {
            if (newVal === 'horizontal') {
                this.$.currentVertical.style.display = 'none';
                this.$.nextVertical.style.display = 'none';
                this.$.currentHorizontal.style.display = 'block';
                this.$.nextHorizontal.style.display = 'block';
            } else if (newVal === 'vertical') {
                this.$.currentVertical.style.display = 'block';
                this.$.nextVertical.style.display = 'block';
                this.$.currentHorizontal.style.display = 'none';
                this.$.nextHorizontal.style.display = 'none';
            } else {
                throw new Error('Unexpected orientation: "' + newVal + '"');
            }
        },

        ready: function() {
            var sponsors = nodecg.Replicant('sponsors');
            sponsors.on('change', function(oldVal, newVal) {
                this.sponsors = newVal;

                // If no sponsor is showing yet, show the first sponsor immediately
                if (!this.currentSponsor) {
                    this.setCurrentSponsor(newVal[0]);

                    TweenLite.fromTo([this.$.currentVertical, this.$.currentHorizontal], FADE_DURATION,
                        {opacity: 0},
                        {
                            opacity: 1,
                            ease: FADE_EASE
                        }
                    );
                }
            }.bind(this));

            // Cycle through sponsor logos every this.duration seconds
            setTimeout(this.prepareSponsorChange.bind(this), HOLD_DURATION * 1000);
        },

        setCurrentSponsor: function(sponsor) {
            this.currentSponsor = sponsor;

            if (sponsor.vertical) {
                this.$.currentVertical.src = sponsor.vertical.url;
            } else {
                this.$.currentVertical.src = sponsor.horizontal.url;
            }

            if (sponsor.horizontal) {
                this.$.currentHorizontal.src = sponsor.horizontal.url;
            } else {
                this.$.currentHorizontal.src = sponsor.vertical.url;
            }
        },

        setNextSponsor: function(sponsor) {
            if (sponsor.vertical) {
                this.$.nextVertical.src = sponsor.vertical.url;
            } else {
                this.$.nextVertical.src = sponsor.horizontal.url;
            }

            if (sponsor.horizontal) {
                this.$.nextHorizontal.src = sponsor.horizontal.url;
            } else {
                this.$.nextHorizontal.src = sponsor.vertical.url;
            }
        },

        prepareSponsorChange: function() {
            // If there's no images, do nothing
            if (!this.sponsors|| this.sponsors.length <= 0) {
                debug.log('[sponsors] prepareSponsorChange | No sponsors, returning early.' +
                    ' Will try again in %s seconds.', HOLD_DURATION);
                setTimeout(this.prepareSponsorChange.bind(this), HOLD_DURATION * 1000);
                return;
            }

            // Figure out the array index of the current sponsor
            var currentIdx = -1;
            this.sponsors.some(function(sponsor, index) {
                if (sponsor.name === this.currentSponsor.name) {
                    currentIdx = index;
                    return true;
                }
            }.bind(this));

            var nextIdx = currentIdx + 1;

            // If this index is greater than the max, loop back to the start
            if (nextIdx >= this.sponsors.length) nextIdx = 0;
            var nextSponsor = this.sponsors[nextIdx];

            // If the next image is the same as the current one, don't do anything
            // TODO: re-enable this and make it not shit
            //if (this.currentSponsor.checksum === nextSponsor.checksum) return;

            // Load the new image into #nextVertical and #nextHorizontal
            this.setNextSponsor(nextSponsor);

            // Wait until the image has loaded, then trigger the crossfade
            if (this.areBothNextImageElementsLoaded()) {
                this.crossfadeToSponsor(nextSponsor);
            } else {
                oneTime(this.$.nextVertical, 'loaded-changed', function() {
                    if (this.areBothNextImageElementsLoaded()) {
                        this.crossfadeToSponsor(nextSponsor);
                    }
                }.bind(this));

                oneTime(this.$.nextHorizontal, 'loaded-changed', function() {
                    if (this.areBothNextImageElementsLoaded()) {
                        this.crossfadeToSponsor(nextSponsor);
                    }
                }.bind(this));
            }
        },

        areBothNextImageElementsLoaded: function () {
            return this.$.nextVertical.loaded && this.$.nextHorizontal.loaded;
        },

        crossfadeToSponsor: function (nextSponsor) {
            // Create one-time animation to fade from current to next.
            var tl = new TimelineLite();
            tl.add('start');
            tl.to([this.$.currentVertical, this.$.currentHorizontal], 1, {
                onStart: function() {
                    debug.time('sponsorCrossfade');
                },
                opacity: 0,
                ease: Power1.easeInOut
            }, 'start');
            tl.to([this.$.nextVertical, this.$.nextHorizontal], 1, {
                opacity: 1,
                ease: Power1.easeInOut,
                onComplete: function() {
                    debug.timeEnd('sponsorCrossfade');
                }
            }, 'start');

            // Reset, prep for, and trigger next iteration
            tl.call(function() {
                this.setCurrentSponsor(nextSponsor);
                setTimeout(this.prepareSponsorChange.bind(this), HOLD_DURATION * 1000);
            }.bind(this));
            tl.set([
                this.$.currentVertical,
                this.$.currentHorizontal,
                this.$.nextVertical,
                this.$.nextHorizontal
            ], {clearProps: 'opacity'}, '+=0.1');
        }
    });
});
