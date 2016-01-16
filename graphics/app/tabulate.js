/* global define */
define(function() {
    'use strict';

    /**
     * Given a string, modifies all numbers in that string to use the unicode characters
     * for tabular numbers. This makes all the numbers monospace, but leaves all other characters as-is.
     * This is hardcoded for TypeKit's version of Proxima Nova. It will not work with any other font.
     * @param {String} str - The string to tabulate.
     * @returns {String}
     */
    return function(str) {
        // Disabled for now
        return str;
        return str.split('').map(function(char) {
            switch (char) {
                case '0':
                    return '\uf639';
                case '1':
                    return '\uf6dc';
                case '2':
                    return '\uf63a';
                case '3':
                    return '\uf63b';
                case '4':
                    return '\uf63c';
                case '5':
                    return '\uf63d';
                case '6':
                    return '\uf63e';
                case '7':
                    return '\uf63f';
                case '8':
                    return '\uf640';
                case '9':
                    return '\uf641';
                default:
                    return char;
            }
        }).join('');
    };
});
