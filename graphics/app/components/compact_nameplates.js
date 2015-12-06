/* global definer */
define([
    'globals',
    'classes/compact_nameplate'
], function (globals, CompactNameplate) {
    'use strict';

    //var nameplates = [new Nameplate(), new Nameplate(), new Nameplate(), new Nameplate()];
    var normalNameplates = [];
    var compactNameplates = [
        new CompactNameplate(0, 'left'),
        new CompactNameplate(1, 'right'),
        new CompactNameplate(2, 'left'),
        new CompactNameplate(3, 'right')
    ];

    var allNameplates = normalNameplates.concat(compactNameplates);

    return {
        disable: function() {
            allNameplates.forEach(function(nameplate) {
                nameplate.disable();
            });
        },

        enable: function() {
            allNameplates.forEach(function(nameplate) {
                nameplate.enable();
            });
        },

        /**
         *
         */
        configure:  function (arrayOfOpts) {
            arrayOfOpts = arrayOfOpts || [];
            var numNameplates = arrayOfOpts.length;

            // Enable/disable nameplates as appropriate.
            allNameplates.forEach(function(nameplate, index) {
                if (index <= numNameplates - 1) {
                    nameplate.enable();
                    nameplate.configure(arrayOfOpts[index]);
                } else {
                    nameplate.disable();
                }
            });
        }
    };
});
