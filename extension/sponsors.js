'use strict';

var chokidar = require('chokidar');
var path = require('path');
var fs = require('fs');
var SPONSOR_IMAGES_PATH = path.resolve(__dirname, '../view/img/sponsor');
var BASE_URL = '/view/sgdq15-layouts/img/sponsor/';
var ALLOWED_EXTS = [
    '.png'
];

module.exports = function(nodecg) {
    nodecg.log.info('Monitoring "%s" for changes to sponsor logos...', SPONSOR_IMAGES_PATH);

    var sponsorImageUrls = nodecg.Replicant('sponsorImageUrls');

    var watcher = chokidar.watch(SPONSOR_IMAGES_PATH + '/*.png', {
        ignored: /[\/\\]\./,
        persistent: true,
        ignoreInitial: true,
        usePolling: true // Non-polling is really buggy for us right now.
    });

    watcher.on('add', reloadImages);
    watcher.on('change', reloadImages);
    watcher.on('unlink', reloadImages);
    watcher.on('error', function(e) {
        nodecg.error(e.stack);
    });


    // Initialize
    reloadImages();

    // On changed/added/deleted
    function reloadImages(filename) {
        if (filename) {
            nodecg.log.info('Sponsor logo "%s" changed, reloading all sponsor logos...', path.basename(filename));
        }

        // Array with URLs to all the images
        var imageUrls = [];

        // Scan the images dir
        var imagesDir = fs.readdirSync(SPONSOR_IMAGES_PATH);
        imagesDir.forEach(function(image) {
            if (extAllowed(path.extname(image))) {
                // Add the route to this image
                imageUrls.push(BASE_URL + image);
            }
        });

        // Overwrite the replicant
        sponsorImageUrls.value = imageUrls;
    }
};

function extAllowed(ext) {
    return ALLOWED_EXTS.indexOf(ext) >= 0;
}
