(function() {
    'use strict';

    var startAll = document.getElementById('startAll');
    startAll.addEventListener('click', function() {
        nodecg.sendMessage('startTime', 'all');
    });

    var pauseAll = document.getElementById('pauseAll');
    pauseAll.addEventListener('click', function() {
        nodecg.sendMessage('pauseTime', 'all');
    });

    var resetAll = document.getElementById('resetAll');
    resetAll.addEventListener('click', function() {
        window.setDialogInfo('all', 'everyone');
        resetDialog.open();
    });

    /* ----- */

    var startButtons = Array.prototype.slice.call(document.querySelectorAll('#play'));
    var checklistStatus = document.getElementById('checklistStatus');

    var checklistComplete = nodecg.Replicant('checklistComplete');
    checklistComplete.on('change', function(oldVal, newVal) {
        if (newVal) {
            startButtons.forEach(function(button) {
                button.removeAttribute('disabled');
            });

            startAll.removeAttribute('disabled');
            startAll.querySelector('#startAll-notReady').style.display = 'none';
            startAll.querySelector('#startAll-ready').style.display = 'flex';

            checklistStatus.innerText = 'Checklist Complete';
            checklistStatus.style.fontWeight = 'normal';
        } else {
            startButtons.forEach(function(button) {
                button.setAttribute('disabled', 'true');
            });

            startAll.setAttribute('disabled', 'true');
            startAll.querySelector('#startAll-notReady').style.display = 'inline';
            startAll.querySelector('#startAll-ready').style.display = 'none';

            checklistStatus.innerText = 'Checklist Incomplete, complete before starting';
            checklistStatus.style.fontWeight = 'bold';
        }
    });

    /* ----- */

    var dialogIndex = 0;
    var runnerNameEls = Array.prototype.slice.call(document.getElementsByClassName('runnerName'));

    window.setDialogInfo = function (index, name, currentTime) {
        dialogIndex = index;

        runnerNameEls.forEach(function(el) {
            el.innerText = name;
        });

        if (currentTime) {
            editInput.value = currentTime;
        }
    };

    /* ----- */

    var resetDialog = document.getElementById('resetDialog');
    var confirmReset = document.getElementById('confirmReset');

    confirmReset.addEventListener('click', function() {
        confirmReset.setAttribute('disabled', 'true');
        nodecg.sendMessage('resetTime', dialogIndex, function() {
            resetDialog.close();
            confirmReset.removeAttribute('disabled');
        });
    });

    /* ----- */

    var editDialog = document.getElementById('editDialog');
    var confirmEdit = document.getElementById('confirmEdit');
    var editInput = document.getElementById('editInput');

    editInput.addEventListener('iron-input-validate', function(e) {
        // e.target.validity.valid seems to be busted. Use this workaround.
        var isValid = !e.target.hasAttribute('invalid');
        if (isValid) {
            confirmEdit.removeAttribute('disabled');
        } else {
            confirmEdit.setAttribute('disabled', 'true');
        }
    });

    confirmEdit.addEventListener('click', function() {
        if (editInput.validate()) {
            var ts = editInput.value.split(':');
            var ms = Date.UTC(1970, 0, 1, ts[0], ts[1], ts[2]);

            confirmEdit.setAttribute('disabled', 'true');
            nodecg.sendMessage('setTime', {index: dialogIndex, ms: ms}, function() {
                editDialog.close();
                confirmEdit.removeAttribute('disabled');
            });
        }
    });
})();
