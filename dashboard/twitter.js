/* jshint -W106 */
(function() {
    'use strict';

    var disabledCover = document.getElementById('cover');
    var layoutName = disabledCover.querySelector('.layoutName');

    var layoutState = nodecg.Replicant('layoutState');
    layoutState.on('change', function(oldVal, newVal) {
        if (newVal.page === 'open') {
            layoutName.innerHTML = newVal.currentLayout;
            switch (newVal.currentLayout) {
                case '4x3_4':
                    layoutName.innerHTML = '3x2_4, 4x3_4';
                    /* falls through */
                case 'ds':
                    disabledCover.reason = 'badLayout';
                    break;
                default:
                    disabledCover.reason = null;
            }
        }

        else {
            disabledCover.reason = newVal.page;
        }
    });
})();
