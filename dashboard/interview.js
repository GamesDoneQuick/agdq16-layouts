(function() {
    'use strict';

    var disabledCover = document.getElementById('cover');

    var layoutState = nodecg.Replicant('layoutState');
    layoutState.on('change', function(oldVal, newVal) {
        if (newVal.page === 'open') {
            if (layoutState.value.currentLayout !== 'interview') {
                disabledCover.reason = 'badLayout';
            } else {
                disabledCover.reason = null;
            }
        }

        else {
            disabledCover.reason = newVal.page;
        }
    });

    /* ----- */

    var interviewNames = nodecg.Replicant('interviewNames');
    var take = document.getElementById('take');
    take.addEventListener('click', function() {
        interviewNames.value = [
            document.getElementById('preview1').value,
            document.getElementById('preview2').value,
            document.getElementById('preview3').value,
            document.getElementById('preview4').value
        ];
    });

    interviewNames.on('change', function(oldVal, newVal) {
        document.getElementById('program1').value = newVal[0];
        document.getElementById('program2').value = newVal[1];
        document.getElementById('program3').value = newVal[2];
        document.getElementById('program4').value = newVal[3];
    });

    /* ------ */

    var show = document.getElementById('show');
    var hide = document.getElementById('hide');
    var auto = document.getElementById('auto');
    var showing = nodecg.Replicant('interviewLowerthirdShowing');

    show.addEventListener('click', function() {
        showing.value = true;
    });

    hide.addEventListener('click', function() {
        showing.value = false;
    });

    auto.addEventListener('click', function() {
        nodecg.sendMessage('pulseInterviewLowerthird', 10);
    });

    showing.on('change', function(oldVal, newVal) {
        if (newVal) {
            show.setAttribute('disabled', 'true');
            hide.removeAttribute('disabled');
            auto.setAttribute('disabled', 'true');
        } else {
            show.removeAttribute('disabled');
            hide.setAttribute('disabled', 'true');
            auto.removeAttribute('disabled');
        }
    });

    nodecg.Replicant('interviewLowerthirdPulsing').on('change', function(oldVal, newVal) {
        var shouldDisableHideButton = !showing.value ? true : newVal;
        if (shouldDisableHideButton) {
            hide.setAttribute('disabled', 'true');
        } else {
            hide.removeAttribute('disabled');
        }
    });
})();
