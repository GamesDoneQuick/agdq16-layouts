'use strict';

var chokidar = require('chokidar');
var debounce = require('debounce');
var fs = require('fs');
var md5File = require('md5-file');
var path = require('path');

var SPONSOR_IMAGES_PATH = path.resolve(__dirname, '../graphics/img/sponsors');
var BASE_URL = '/graphics/agdq16-layouts/img/sponsors/';
var ALLOWED_EXTS = [
    '.png'
];

module.exports = function(nodecg) {
    nodecg.log.info('Monitoring "%s" for changes to sponsor logos...', SPONSOR_IMAGES_PATH);

    var sponsors = nodecg.Replicant('sponsors', {defaultValue: [], persistent: false});
    var watcher = chokidar.watch(SPONSOR_IMAGES_PATH + '/*.png', {
        ignored: /[\/\\]\./,
        ignoreInitial: true
    });

    watcher.on('add', debounce(reloadSponsors, 500));
    watcher.on('change', debounce(reloadSponsors, 500));

    watcher.on('unlink', function(filepath) {
        var parsedPath = path.parse(filepath);
        var nameParts = parsedPath.name.split('-');
        var sponsorName = nameParts[0];
        var orientation = nameParts[1];

        if (!sponsorName || !isValidOrientation(orientation) || nameParts.length !== 2) {
            return;
        }

        sponsors.value.some(function(sponsor, index) {
            if (sponsor.name === sponsorName) {
                sponsor[orientation] = null;
                if (!sponsor.vertical && !sponsor.horizontal) {
                    sponsors.value.splice(index, 1);
                }
                nodecg.log.info('[sponsors] "%s" deleted, removing from rotation', parsedPath.base);
                return true;
            }
        });
    });

    watcher.on('error', function(e) {
        nodecg.error(e.stack);
    });

    // Initialize
    reloadSponsors();

    // On changed/added
    function reloadSponsors(changeOrAddition) {
        if (changeOrAddition) {
            nodecg.log.info('[sponsors] Change detected, reloading all sponsors...');
        }

        // Scan the images dir
        var sponsorsDir = fs.readdirSync(SPONSOR_IMAGES_PATH);
        sponsorsDir.forEach(function(filename) {
            var ext = path.extname(filename);
            var filepath = path.join(SPONSOR_IMAGES_PATH, filename);

            if (!extAllowed(ext)) {
                return;
            }

            var parsedPath = path.parse(filepath);
            var nameParts = parsedPath.name.split('-');
            var sponsorName = nameParts[0];
            var orientation = nameParts[1];

            if (!sponsorName || !isValidOrientation(orientation) || nameParts.length !== 2) {
                nodecg.log.error('[sponsors] Unexpected file name "%s". ' +
                    'Please rename to this format: {name}-{orientation}.png', filename);
                return;
            }

            md5File(filepath, function (err, sum) {
                if (err) {
                    nodecg.log.error(err);
                    return;
                }

                var fileData = {
                    url: BASE_URL + filename,
                    filename: filename,
                    checksum: sum
                };

                // Look for an existing entry in the replicant with this filename, and update if found and md5 changed.
                var foundExistingSponsor = sponsors.value.some(function(sponsor) {
                    if (sponsor.name === sponsorName) {
                        if (!sponsor[orientation] || sponsor[orientation].checksum !== sum) {
                            sponsor[orientation] = fileData;
                        }
                        return true;
                    }
                });

                // If there was no existing sponsor with this filename, add a new one.
                if (!foundExistingSponsor) {
                    var sponsor = {name: sponsorName};
                    sponsor[orientation] = fileData;
                    sponsors.value.push(sponsor);
                }
            });
        });
    }
};

function extAllowed(ext) {
    return ALLOWED_EXTS.indexOf(ext) >= 0;
}

function isValidOrientation(orientation) {
    if (typeof orientation !== 'string') return false;
    return orientation === 'horizontal' || orientation === 'vertical';
}
