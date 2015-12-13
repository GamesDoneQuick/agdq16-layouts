/* jshint -W106 */
(function() {
    'use strict';

    console.log('test');

    var notReadyCover = document.getElementById('notReady');
    var notReadyCover_closed = document.getElementById('notReady-closed');
    var notReadyCover_preloading = document.getElementById('notReady-preloading');
    var notReadyCover_badLayout = document.getElementById('notReady-badLayout');
    var layoutName = notReadyCover_badLayout.querySelector('.layoutName');

    var layoutState = nodecg.Replicant('layoutState');
    layoutState.on('change', function(oldVal, newVal) {
        if (newVal.page === 'open') {
            layoutName.innerHTML = newVal.currentLayout;
            switch (newVal.currentLayout) {
                case '4x3_4':
                    layoutName.innerHTML = '3x2_4, 4x3_4';
                    /* falls through */
                case 'ds':
                    notReadyCover.style.display = 'flex';
                    notReadyCover_closed.style.display = 'none';
                    notReadyCover_preloading.style.display = 'none';
                    notReadyCover_badLayout.style.display = 'inline';
                    break;
                default:
                    notReadyCover.style.display = 'none';
            }
        }

        else {
            notReadyCover.style.display = 'flex';
            notReadyCover_badLayout.style.display = 'none';

            switch (newVal.page) {
                case 'closed':
                    notReadyCover_closed.style.display = 'inline';
                    notReadyCover_preloading.style.display = 'none';
                    break;
                case 'preloading':
                    notReadyCover_closed.style.display = 'none';
                    notReadyCover_preloading.style.display = 'inline';
                    break;
                case 'open':
                    break;
                default:
                    throw new Error('[sponsors] Unexpected layoutState: "' + newVal + '"');
            }
        }
    });
})();
