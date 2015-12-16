/* global requirejs, Polymer, TimelineLite, TweenLite, Power2 */
requirejs(['debug'], function(debug) {
    'use strict';

    var SONG_EXTRA_WIDTH = 40;

    /* jshint -W064 */
    Polymer({
        /* jshint +W064 */

        is: 'now-playing',

        properties: {
            song: String,
            album: String
        },

        observers: [
            '_resizeContainers(song, album)'
        ],

        ready: function() {
            var self = this;
            var tl = new TimelineLite({autoRemoveChildren: true});
            var nowPlaying = nodecg.Replicant('nowPlaying');

            var songContainer = this.$.songContainer;
            var songContainerWidth = 0;
            var songContainerX = '-100%';
            var songContainerProxy = {};
            Object.defineProperty(songContainerProxy, 'x', {
                set: function (newVal) {
                    var percentage = parseFloat(newVal) / 100;
                    songContainerX = newVal;
                    TweenLite.set(songContainer, {
                        x: Math.round(songContainerWidth * percentage)
                    });
                },
                get: function() {
                    return songContainerX;
                }
            });

            var albumContainer = this.$.albumContainer;
            var albumContainerWidth = 0;
            var albumContainerX = '-100%';
            var albumContainerProxy = {};
            Object.defineProperty(albumContainerProxy, 'x', {
                set: function (newVal) {
                    var percentage = parseFloat(newVal) / 100;
                    albumContainerX = newVal;
                    TweenLite.set(albumContainer, {
                        x: Math.round(albumContainerWidth * percentage)
                    });
                },
                get: function() {
                    return albumContainerX;
                }
            });

            nodecg.Replicant('nowPlayingPulsing').on('change', function(oldVal, newVal) {
                if (newVal) {
                    tl.call(function() {
                        self.style.visibility = 'visible';

                        self.song = nowPlaying.value.song;
                        songContainerProxy.x = '-100%';

                        self.album = nowPlaying.value.album;
                        albumContainerProxy.x = '-100%';

                        songContainerWidth = songContainer.getBoundingClientRect().width;
                        albumContainerWidth = albumContainer.getBoundingClientRect().width;
                    }, null, null, '+=0.1');

                    tl.to([songContainerProxy, albumContainerProxy], 1.2, {
                        onStart: function() {
                            debug.time('nowPlayingEnter');
                        },
                        x: '0%',
                        ease: Power2.easeOut,
                        onComplete: function() {
                            debug.timeEnd('nowPlayingEnter');
                        }
                    });
                }

                else {
                    tl.to([songContainerProxy, albumContainerProxy], 1.2, {
                        onStart: function() {
                            debug.time('nowPlayingExit');
                        },
                        x: '-100%',
                        ease: Power2.easeIn,
                        onComplete: function() {
                            self.style.visibility = 'hidden';
                            debug.timeEnd('nowPlayingExit');
                        }
                    });
                }
            });
        },

        _resizeContainers: function() {
            this.$.songContainer.style.width = 'auto';

            var songContainerWidth = this.$.songContainer.getBoundingClientRect().width;
            var albumContainerWidth = this.$.albumContainer.getBoundingClientRect().width;
            if (songContainerWidth < albumContainerWidth + SONG_EXTRA_WIDTH) {
                this.$.songContainer.style.width = albumContainerWidth + SONG_EXTRA_WIDTH + 'px';
            }
        }
    });
});
