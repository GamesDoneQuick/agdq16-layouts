(function() {
    'use strict';

    var toast = document.getElementById('toast');
    var update = document.getElementById('update');

    update.addEventListener('click', function() {
        update.setAttribute('disabled', 'true');
        nodecg.sendMessage('updateSchedule', function (err, updated) {
            update.removeAttribute('disabled');

            if (err) {
                console.error(err.message);
                toast.text = 'Error updating schedule. Check console.';
                toast.show();
                return;
            }

            if (updated) {
                console.info('[agdq16-layouts] Schedule successfully updated');
                toast.text = 'Successfully updated schedule.';
                toast.show();
            } else {
                console.info('[agdq16-layouts] Schedule unchanged, not updated');
                toast.text = 'Schedule unchanged, not updated.';
                toast.show();
            }
        });
    });

    /* ----- */

    var typeahead = document.getElementById('typeahead');
    typeahead.addEventListener('keyup', function(e) {
        // Enter key
        if (e.which === 13 && typeahead.inputValue) {
            takeTypeahead();
        }
    });

    var schedule = nodecg.Replicant('schedule');
    schedule.on('change', function(oldVal, newVal) {
        typeahead.localCandidates = newVal.map(function(speedrun) {
            return speedrun.name;
        });
    });

    // This is quite inefficient, but it works for now.
    var take = document.getElementById('take');
    take.addEventListener('click', takeTypeahead);

    function takeTypeahead() {
        take.setAttribute('disabled', 'true');

        var nameToFind = typeahead.inputValue;

        // Find the run based on the name.
        var matched = schedule.value.some(function(run) {
            if (run.name.toLowerCase() === nameToFind.toLowerCase()) {
                nodecg.sendMessage('setCurrentRunByOrder', run.order, function() {
                    take.removeAttribute('disabled');
                    typeahead.inputValue = '';
                    typeahead._suggestions = [];
                });
                return true;
            }
        });

        if (!matched) {
            take.removeAttribute('disabled');
            toast.text = 'Could not find speedrun with name "' + nameToFind + '".';
            toast.show();
        }
    }

    /* ----- */

    var nextBtn = document.getElementById('next');
    var previousBtn = document.getElementById('previous');
    var nextRunSpan = document.getElementById('nextRun');

    nextBtn.addEventListener('click', function() {
        nextBtn.setAttribute('disabled', 'true');
        nodecg.sendMessage('nextRun');
    });

    previousBtn.addEventListener('click', function() {
        previousBtn.setAttribute('disabled', 'true');
        nodecg.sendMessage('previousRun');
    });

    schedule.on('declared', function() {
        var currentRun = nodecg.Replicant('currentRun');
        var runInfoName = document.querySelector('label-value[label="Name"]');
        var runInfoConsole = document.querySelector('label-value[label="Console"]');
        var runInfoRunners = document.querySelector('label-value[label="Runners"]');
        var runInfoCommentators = document.querySelector('label-value[label="Commentators"]');
        var runInfoEstimate = document.querySelector('label-value[label="Estimate"]');
        var runInfoCategory = document.querySelector('label-value[label="Category"]');
        var runInfoOrder = document.querySelector('label-value[label="Order"]');
        currentRun.on('change', function(oldVal, newVal) {
            if (!newVal) return;

            runInfoName.value = newVal.name;
            runInfoConsole.value = newVal.console;
            runInfoRunners.value = newVal.concatenatedRunners;
            runInfoCommentators.value = newVal.commentators;
            runInfoEstimate.value = newVal.estimate;
            runInfoCategory.value = newVal.category;
            runInfoOrder.value = newVal.order;

            // Disable "next" button if at end of schedule
            if (newVal.nextRun) {
                nextRunSpan.innerText = newVal.nextRun.name;
                nextBtn.removeAttribute('disabled');
            } else {
                nextRunSpan.innerText = 'None';
                nextBtn.setAttribute('disabled', 'true');
            }

            // Disable "prev" button if at start of schedule
            if (newVal.order <= 1) {
                previousBtn.setAttribute('disabled', 'true');
            } else {
                previousBtn.removeAttribute('disabled');
            }
        });
    });
})();
