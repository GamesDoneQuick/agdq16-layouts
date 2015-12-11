/* global define */
define([
    'debug',

    'layouts/3ds',

    'layouts/3x2_1',
    'layouts/3x2_2',

    'layouts/4x3_1',
    'layouts/4x3_2',
    'layouts/4x3_3',
    'layouts/4x3_4',

    'layouts/16x9_1',
    'layouts/16x9_2',

    'layouts/break',

    'layouts/ds',
    'layouts/ds_portrait'
], function(debug) {
    'use strict';

    var layouts = {
        '3ds': arguments[1],

        '3x2_1': arguments[2],
        '3x2_2': arguments[3],

        '4x3_1': arguments[4],
        '4x3_2': arguments[5],
        '4x3_3': arguments[6],
        '4x3_4': arguments[7],

        '16x9_1': arguments[8],
        '16x9_2': arguments[9],

        'break': arguments[10],

        'ds': arguments[11],
        'ds_portrait': arguments[12]
    };

    var currentLayoutName, currentLayoutIndex;
    var numLayouts = Object.keys(layouts).length;

    function setLayout(name) {
        debug.log('[layout] setLayout(%s)', name);

        if (currentLayoutName && layouts[currentLayoutName].detached){
            layouts[currentLayoutName].detached();
        }

        layouts[name].attached();

        currentLayoutName = name;
        currentLayoutIndex = Object.keys(layouts).indexOf(name);
    }

    return Object.create(Object.prototype, {
        next: {
            value: function() {
                if (typeof currentLayoutIndex === 'undefined') {
                    setLayout(Object.keys(layouts)[0]);
                    return;
                }

                currentLayoutIndex += 1;
                if (currentLayoutIndex >= numLayouts) {
                    currentLayoutIndex = 0;
                    console.log('--- END OF LAYOUTS, STARTING FROM BEGINNING ---');
                }

                setLayout(Object.keys(layouts)[currentLayoutIndex]);
            }
        },
        changeTo: {
            value: setLayout
        },
        currentLayoutName: {
            get: function() {return currentLayoutName;}
        },
        currentLayoutIndex: {
            get: function() {return currentLayoutIndex;}
        }
    });
});
