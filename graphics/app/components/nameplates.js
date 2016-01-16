/* global define */
define([
    'globals',
    'classes/nameplate'
], function (globals, Nameplate) {
    'use strict';

    var nameplates = [
        new Nameplate(0, 'left'),
        new Nameplate(1, 'right'),
        new Nameplate(2, 'left'),
        new Nameplate(3, 'right')
    ];

    // Start disabled
    nameplates.forEach(function(nameplate) {
        nameplate.disable();
    });

    function extend(obj, src) {
        for (var key in src) {
            if (src.hasOwnProperty(key)) obj[key] = src[key];
        }
        return obj;
    }

    return {
        disable: function() {
            nameplates.forEach(function(nameplate) {
                nameplate.disable();
            });
        },

        enable: function() {
            nameplates.forEach(function(nameplate) {
                nameplate.enable();
            });
        },

        /**
         *
         */
        configure:  function (globalOpts, perNameplateOpts) {
            var numNameplates = perNameplateOpts.length;

            // Enable/disable nameplates as appropriate.
            nameplates.forEach(function(nameplate, index) {
                if (index <= numNameplates - 1) {
                    var opts = extend(perNameplateOpts[index], globalOpts);
                    nameplate.enable();
                    nameplate.configure(opts);
                } else {
                    nameplate.disable();
                }
            });
        }
    };
});
