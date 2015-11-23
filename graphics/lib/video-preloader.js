(function (root, factory) {
    'use strict';

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    } else {
        // Browser globals
        root.preloadVideos = factory();
    }
}(this, function () {
    'use strict';

    var preloadedUrls = [];
    function isPreloaded(url) {
        return preloadedUrls.indexOf(url) > -1;
    }

    // Finds the earliest unbuffered timestamp in a video.
    // Returns undefined if the entire video is buffered.
    function findEarliestGap(videoNode) {
        var numChunks = videoNode.buffered.length;

        // If we have one chunk that spans the entire video, then hey there's no gaps!
        if (numChunks === 1) {
            var start = videoNode.buffered.start(0);
            var end = videoNode.buffered.end(0);
            if (start === 0 && end === videoNode.duration) {
                return;
            }
        }

        // Loop over each chunk, find any gaps.
        for (var i = 0; i < numChunks; i++) {
            var nextIndex = i + 1;

            // If this is the last chunk and its end is the end of the video, we have no gaps.
            // Else we need to buffer the end.
            if (nextIndex >= numChunks) {
                if (videoNode.buffered.end(i) === videoNode.duration) {
                    return;
                } else {
                    return videoNode.buffered.end(i);
                }
            }

            // If the next segment's start time isn't the same as this chunk's end time, we have a gap.
            var currentEnd = videoNode.buffered.end(i);
            var nextStart = videoNode.buffered.start(nextIndex);
            if (currentEnd !== nextStart) {
                return currentEnd;
            }
        }
    }

    return function (urls, cb) {
        var videoUrls = [];
        if (typeof urls === 'string') {
            videoUrls.push(urls);
        } else if (Array.isArray(urls)) {
            videoUrls = urls;
        } else {
            throw new Error('Invalid first argument type: ' + typeof urls);
        }

        // Filter out any urls that are already preloaded
        var urlsToPreload = [];
        videoUrls.forEach(function(url) {
            if (!isPreloaded(url)) {
                urlsToPreload.push(url);
            }
        });

        // If all urls are preloaded, immediately invoke the callback
        if (urlsToPreload.length <= 0) {
            cb(null, typeof urls === 'string' ? urls : videoUrls);
            return;
        }

        /* We only allow WebM because we know it will have its metadata at the start of the file,
         * which this preload method depends on. */
        var numLoaded = 0;
        urlsToPreload.forEach(function(url) {
            // Create a hidden and muted video tag that will be used to preload the video.
            var videoLoader = document.createElement('video');
            videoLoader.style.display = 'none';
            videoLoader.muted = true;
            document.body.appendChild(videoLoader);

            // Create a "source" tag for this webm and append it to videoLoader.
            var source = document.createElement('source');
            source.src = url;
            source.type = 'video/webm';
            videoLoader.appendChild(source);
            videoLoader.fullyLoaded = false;
            videoLoader.addEventListener('progress', function () {
                if (videoLoader.fullyLoaded) return;
                if (videoLoader.duration) {
                    var percent = (videoLoader.buffered.end(0) / videoLoader.duration) * 100;
                    if (percent >= 100) {
                        if (!isPreloaded(url)) preloadedUrls.push(url);
                        videoLoader.fullyLoaded = true;
                        videoLoader.remove();

                        numLoaded++;
                        if (numLoaded === urlsToPreload.length) {
                            cb(null, typeof urls === 'string' ? urls : videoUrls);
                        }
                    }
                }
            }, false);

            /* I have no idea why, but this event seems to be emitted every time the "progress" events stop coming in.
             * So, we can use this event to double-check that we have actually buffered the entire video.
             * If we find a gap in the buffer, we seek to it and move the playhead a bit.
             * This appears to force the browser to resume buffering, and the "progress" events start up again. */
            videoLoader.addEventListener('canplay', function () {
                var gap = findEarliestGap(videoLoader);
                if (gap) {
                    videoLoader.currentTime = gap;
                    videoLoader.currentTime++;
                } else {
                    videoLoader.fullyLoaded = true;
                    numLoaded++;
                    if (numLoaded === urlsToPreload.length) {
                        videoLoader.remove();
                        cb(null, typeof urls === 'string' ? urls : videoUrls);
                    }
                }
            }, false);
        });
    };
}));
