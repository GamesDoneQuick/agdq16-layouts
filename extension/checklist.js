'use strict';

module.exports = function(nodecg) {
    // Create defaults array
    var checklistDefault = [
        {name: 'Check for Interview/Video to play', complete: false},
        {name: 'Cue game music', complete: false},
        {name: 'Run Ad*', complete: false},
        {name: 'Commentator Mics', complete: false},
        {name: 'Runner Game Audio', complete: false},
        {name: 'TVs have Video', complete: false},
        {name: 'Restart Recording', complete: false},
        {name: 'Stream Audio', complete: false},
        {name: 'Stream Video & Deinterlacing', complete: false},
        {name: 'Stream Layout', complete: false},
        {name: 'Camera', complete: false},
        {name: 'Reset Timer', complete: false},
        {name: 'Check Notes', complete: false}
    ];

    // Instantiate replicant with defaults object, which will load if no persisted data is present.
    var checklist = nodecg.Replicant('checklist', {defaultValue: checklistDefault});

    // If any entries in the config aren't present in the replicant,
    // (which could happen when a persisted replicant value is loaded) add them.
    checklistDefault.forEach(function(task){
        var exists = checklist.value.some(function(existingTask) {
            return existingTask.name === task.name;
        });

        if (!exists) {
            checklist.value.push(task);
        }
    });

    // Likewise, if there are any entries in the replicant that are no longer present in the config, remove them.
    checklist.value.forEach(function(existingTask, index) {
        var exists = checklistDefault.some(function(task) {
            return task.name === existingTask.name;
        });

        if (!exists) {
            checklist.value.splice(index, 1);
        }
    });

    var checklistComplete = nodecg.Replicant('checklistComplete', {defaultValue: false});
    checklist.on('change', function(oldVal, newVal) {
        var numUnfinishedTasks = newVal.filter(function(task) {
            return !task.complete;
        }).length;

        checklistComplete.value = numUnfinishedTasks === 0;
    });

    return {
        reset: function() {
            checklist.value.forEach(function(task) {
                task.complete = false;
            });
        }
    };
};
