'use strict';

var chokidar = require('chokidar');
var path = require('path');
var fs = require('fs');
var format = require('util').format;
var debounce = require('debounce');
var md5File = require('md5-file');

var ADVERTISEMENTS_PATH = path.resolve(__dirname, '../graphics/advertisements');
var BASE_URL = '/graphics/agdq16-layouts/advertisements/';
var IMAGE_EXTS = ['.png', '.jpg', '.gif'];
var VIDEO_EXTS = ['.webm'];

module.exports = function(nodecg) {
    nodecg.log.info('Monitoring "%s" for changes to advertisement assets...', ADVERTISEMENTS_PATH);

    var currentRun = nodecg.Replicant('currentRun');
    nodecg.listenFor('logAdPlay', function(ad) {
        var runnerNames = currentRun.value.runners.reduce(function(prev, curr) {
            if (typeof prev === 'string') {
                return prev + ' ' + curr.name;
            } else {
                return prev.name + ' ' + curr.name;
            }
        });

        var logStr = format('%s, %s, %s, %s\n',
            new Date().toISOString(), ad.filename, currentRun.value.name, runnerNames);

        fs.appendFile('logs/ad_log.csv', logStr, function (err) {
            if (err) {
                nodecg.log.error('[advertisements] Error appending to log:', err.stack);
            }
        });
    });

    var ads = nodecg.Replicant('ads', {defaultValue: [], persistent: false});
    nodecg.Replicant('ftb', {defaultValue: false});

    var watcher = chokidar.watch([
        ADVERTISEMENTS_PATH + '/*.png',
        ADVERTISEMENTS_PATH + '/*.jpg',
        ADVERTISEMENTS_PATH + '/*.gif',
        ADVERTISEMENTS_PATH + '/*.webm'
    ],{
        ignored: /[\/\\]\./,
        persistent: true,
        ignoreInitial: true,
        usePolling: true // Non-polling is really buggy for us right now.
    });

    watcher.on('add', debounce(reloadAdvertisements, 500));
    watcher.on('change', debounce(reloadAdvertisements, 500));

    watcher.on('unlink', debounce(function(filepath) {
        var adFilename = path.basename(filepath);
        nodecg.log.info('Advertisement "%s" deleted, removing from list...', adFilename);

        ads.value.some(function(ad, index) {
            if (ad.filename === adFilename) {
                var adData = ads.value[index];
                ads.value.splice(index, 1);
                nodecg.sendMessage('adRemoved', adData);
                return true;
            }
        });
    }, 500));

    watcher.on('error', function(e) {
        nodecg.error(e.stack);
    });

    // Initialize
    reloadAdvertisements();

    // On changed/added
    function reloadAdvertisements(filepath) {
        if (filepath) {
            nodecg.log.info('Advertisement "%s" changed, reloading all advertisements...', path.basename(filepath));
        }

        // Scan the images dir
        var adsDir = fs.readdirSync(ADVERTISEMENTS_PATH);
        adsDir.forEach(function(adFilename) {
            var ext = path.extname(adFilename);
            var adPath = path.join(ADVERTISEMENTS_PATH, adFilename);

            var type;
            if (isImage(ext)) {
                type = 'image';
            } else if (isVideo(ext)) {
                type = 'video';
            } else {
                return;
            }

            md5File(adPath, function (err, sum) {
                if (err) {
                    nodecg.log.error(err);
                    return;
                }

                var adData = {
                    url: BASE_URL + adFilename,
                    filename: adFilename,
                    type: type,
                    checksum: sum
                };

                // Look for an existing entry in the replicant with this filename, and update if found and md5 changed.
                var foundExistingAd = ads.value.some(function(ad, index) {
                    if (ad.filename === adFilename) {
                        if (ad.checksum !== sum) {
                            ads.value[index] = adData;
                            nodecg.sendMessage('adChanged', adData);
                        }
                        return true;
                    }
                });

                // If there was no existing ad with this filename, add a new one.
                if (!foundExistingAd) {
                    ads.value.push(adData);
                    nodecg.sendMessage('newAd', adData);
                }
            });
        });
    }
};

function isImage(ext) {
    return IMAGE_EXTS.indexOf(ext) >= 0;
}

function isVideo(ext) {
    return VIDEO_EXTS.indexOf(ext) >= 0;
}
