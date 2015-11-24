/* global define */
define([
    'layouts/3ds',

    'layouts/3x2_1',
    'layouts/3x2_2',
    'layouts/3x2_3',
    'layouts/3x2_4',

    'layouts/4x3_1',
    'layouts/4x3_2',
    'layouts/4x3_3',
    'layouts/4x3_4',

    'layouts/16x9_1',
    'layouts/16x9_2',

    'layouts/ds',
    'layouts/ds_portrait'
], function() {
    'use strict';

    var layouts = {
        '3ds': arguments[0],

        '3x2_1': arguments[1],
        '3x2_2': arguments[2],
        '3x2_3': arguments[3],
        '3x2_4': arguments[4],

        '4x3_1': arguments[5],
        '4x3_2': arguments[6],
        '4x3_3': arguments[7],
        '4x3_4': arguments[8],

        '16x9_1': arguments[9],
        '16x9_2': arguments[10],

        'ds': arguments[11],
        'ds_portrait': arguments[12]
    };

    var currentLayout, currentLayoutIndex;
    var numLayouts = Object.keys(layouts).length;
    window.nextLayout = function() {
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
    };

    function setLayout(name) {
        console.log('layout |', name);
        layouts[name]();

        currentLayout = name;
        currentLayoutIndex = Object.keys(layouts).indexOf(name);
    }

    return setLayout;
});
