/* global define, Power1, TweenLite, TimelineLite, createjs */
define([
    'preloader',
    'classes/stage'
],function(preloader, Stage) {
    'use strict';

    var FADE_DURATION = 0.5;
    var FADE_EASE = Power1.easeInOut;
    var IMAGE_AD_DURATION = 30;

    /* ----- */

    function loadAd(ad) {
        console.log('[advertisements] Loading %s', ad.filename);

        var preloadType = ad.type === 'video'
            ? createjs.AbstractLoader.VIDEO
            : createjs.AbstractLoader.IMAGE;

        preloader.loadFile({
            id: 'ad-' + ad.filename,
            src: ad.url,
            gdqType: 'ad',
            gdqFilename: ad.filename,
            type: preloadType
        });
    }

    nodecg.readReplicant('ads', function(value) {
        value.forEach(loadAd);
    });

    nodecg.listenFor('adRemoved', function(ad) {
        console.log('[advertisements] Removing %s', ad.filename);
        preloader.remove('ad-' + ad.filename);
    });

    nodecg.listenFor('adChanged', function(ad) {
        console.log('[advertisements] Reloading %s', ad.filename);
        preloader.remove('ad-' + ad.filename);
        loadAd(ad);
    });

    nodecg.listenFor('newAd', loadAd);

    preloader.on('fileprogress', function(e) {
        if (e.item.gdqType !== 'ad') return;
        nodecg.sendMessage('adLoadProgress', {
            filename: e.item.gdqFilename,
            percentLoaded: e.loaded*100
        });
    });

    preloader.on('fileload', function(e) {
        if (e.item.gdqType !== 'ad') return;
        nodecg.sendMessage('adLoaded', e.item.gdqFilename);
    });

    nodecg.listenFor('getLoadedAds', function() {
         preloader.getItems(false).forEach(function(item) {
             if (item.result && item.item.gdqType === 'ad') {
                 nodecg.sendMessage('adLoaded', item.item.gdqFilename);
             }
         });
    });

    /* ----- */

    var ftbCover = document.getElementById('ftbCover');
    var ftb = nodecg.Replicant('ftb');
    ftb.on('change', function(oldVal, newVal) {
        if (newVal) {
            TweenLite.to(ftbCover, FADE_DURATION, {
                opacity: 1,
                ease: FADE_EASE,
                onComplete: function() {
                    Stage.globalPause = true;
                }
            });
        } else {
            TweenLite.to(ftbCover, FADE_DURATION, {
                onStart: function() {
                    Stage.globalPause = false;
                },
                opacity: 0,
                ease: FADE_EASE
            });
        }
    });

    /* ----- */

    var container = document.getElementById('container');
    var imageContainer = document.getElementById('imageAdContainer');
    var currentImage, nextImage;
    var tl = new TimelineLite({autoRemoveChildren: true});

    nodecg.listenFor('stopAd', function() {
        tl.clear();
        tl.to(imageContainer, FADE_DURATION, {
            opacity: 0,
            ease: FADE_EASE,
            onComplete: removeAdImages
        });
        removeAdVideo();
    });

    // We assume that if we're hearing this message then the ad in question is fully preloaded.
    nodecg.listenFor('playAd', function(ad) {
        var result = preloader.getResult('ad-' + ad.filename);
        if (ad.type === 'image') {
            if (result) {
                showAdImage(result);
                nodecg.sendMessage('logAdPlay', ad);
            } else {
                throw new Error('Tried to play ad but ad was not preloaded:' + ad.filename);
            }
        } else if (ad.type === 'video') {
            if (result) {
                showAdVideo(result);
                nodecg.sendMessage('logAdPlay', ad);
            } else {
                throw new Error('Tried to play ad but ad was not preloaded:' + ad.filename);
            }
        } else {
            throw new Error('[advertisements] Unexpected ad type: "' + ad.type + '"');
        }
    });

    function showAdImage(img) {
        // If the new ad is the same as the old one, do nothing.
        if (currentImage === img) {
            console.log('[advertisements] New img is identical to current image, aborting.');
            return;
        }

        // Clear any existing tweens. Advertisements ain't nothin' to fuck wit.
        tl.clear();
        removeAdVideo();
        tl.add('start');

        // If we already have a next image, ???
        if (nextImage) {
            throw new Error('[advertisements] We\'ve already got a next image queued up, you\'re screwed.');
        }

        // If there is an existing image being displayed, we need to crossfade to the new image.
        if (currentImage) {
            nextImage = img;
            nextImage.style.opacity = 0;
            imageContainer.appendChild(nextImage);

            tl.to(nextImage, FADE_DURATION, {
                opacity: 1,
                ease: FADE_EASE,
                onComplete: function() {
                    imageContainer.removeChild(currentImage);
                    currentImage = nextImage;
                    nextImage = null;
                }
            }, 'start');
        }

        // Else, just fade the new image up.
        else {
            currentImage = img;
            imageContainer.appendChild(currentImage);

            tl.to(imageContainer, FADE_DURATION, {
                onStart: function() {
                    currentImage.style.opacity = 1;
                },
                opacity: 1,
                ease: FADE_EASE
            }, 'start');
        }

        // Fade out after FADE_DURATION seconds.
        tl.to(imageContainer, FADE_DURATION, {
            opacity: 0,
            ease: FADE_EASE,
            onComplete: removeAdImages
        }, 'start+=' + (IMAGE_AD_DURATION + FADE_DURATION));
    }

    function removeAdImages() {
        if (currentImage) {
            imageContainer.removeChild(currentImage);
            currentImage = null;
        }

        if (nextImage) {
            imageContainer.removeChild(nextImage);
            nextImage = null;
        }
    }

    function showAdVideo(video) {
        removeAdVideo();
        removeAdImages();

        video.style.visibility = 'hidden';
        video.id = 'videoPlayer';
        video.classList.add('fullscreen');
        video.play();

        var playingListener = function() {
            video.style.visibility = 'visible';
            video.removeEventListener('playing', playingListener);
        };

        var endedListener = function() {
            video.remove();
            video.removeEventListener('ended', endedListener);
        };

        // The videos sometimes look at bit weird when they first start playing.
        // To polish things up a bit, we hide the video until the 'playing' event is fired.
        video.addEventListener('playing', playingListener);

        // When the video ends, remove it from the page.
        video.addEventListener('ended', endedListener);

        container.appendChild(video);
    }

    function removeAdVideo() {
        while (document.getElementById('videoPlayer')) {
            document.getElementById('videoPlayer').remove();
        }
    }
});


