/* global define */
define(function() {
    'use strict';

    var createjs = require('easel');
    var containerEl = document.getElementById('container');

    function Stage(w, h, id) {
        // Create the canvas element that will become the render target.
        var stageEl = document.createElement('canvas');
        stageEl.id = id;
        stageEl.width = w;
        stageEl.height = h;
        stageEl.style.position = 'absolute';

        // Add the canvas to the DOM
        containerEl.appendChild(stageEl);

        // Create the stage on the target canvas, and create a ticker that will render at 60 fps.
        var stage = new createjs.Stage(stageEl);
        createjs.Ticker.addEventListener('tick', function(event) {
            if (Stage.globalPause || event.paused) return;
            stage.update();
        });

        return stage;
    }

    Stage.globalPause = false;

    return Stage;
});
