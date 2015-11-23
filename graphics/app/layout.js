/* global define */
define([
    'layouts/4x3_4'
], function() {
    'use strict';

    var layouts = {
        '4x3_4': arguments[0]
    };

    return function (name) {
        layouts[name]();
    };
});
