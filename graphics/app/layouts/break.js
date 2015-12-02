/* global define */
define([
    'classes/stage',
    'components/background',
    'components/speedrun'
], function(Stage, setBackground, speedrun) {
    'use strict';

    var LAYOUT_NAME = 'break';
    var STAGE_WIDTH = 371;
    var STAGE_HEIGHT = 330;
    var DESCRIPTION_HEIGHT = 53;

    var createjs = require('easel');
    var stage = new Stage(STAGE_WIDTH, STAGE_HEIGHT, 'break-prizes');
    stage.canvas.style.top = '308px';
    stage.canvas.style.right = '0px';
    stage.canvas.style.backgroundColor = 'black';

    /* ----- */

    var labelContainer = new createjs.Container();
    labelContainer.x = STAGE_WIDTH - 203;

    var labelBackground = new createjs.Shape();
    labelBackground.graphics.beginFill('#00aeef').drawRect(0, 0, 203, 27);
    labelBackground.alpha = 0.78;

    var labelText = new createjs.Text('RAFFLE PRIZES', '800 24px proxima-nova', 'white');
    labelText.x = 14;
    labelText.y = 0;

    labelContainer.addChild(labelBackground, labelText);
    labelContainer.cache(0, 0, 203, 27);

    /* ----- */

    var descriptionContainer = new createjs.Container();
    descriptionContainer.y = STAGE_HEIGHT - DESCRIPTION_HEIGHT;

    var descriptionBackground = new createjs.Shape();
    descriptionBackground.graphics.beginFill('#00aeef').drawRect(0, 0, STAGE_WIDTH, DESCRIPTION_HEIGHT);
    descriptionBackground.alpha = 0.73;
    descriptionBackground.cache(0, 0, STAGE_WIDTH, DESCRIPTION_HEIGHT);

    var descriptionText = new createjs.Text('PRIZE DESCRIPTION THAT TAKES UP TWO LINES MAXIMUM',
        '800 22px proxima-nova', 'white');
    descriptionText.x = 8;
    descriptionText.y = 3;
    descriptionText.lineWidth = STAGE_WIDTH - descriptionText.x * 2;

    descriptionContainer.addChild(descriptionBackground, descriptionText);

    /* ----- */

    stage.addChild(labelContainer, descriptionContainer);

    return {
        attached: function() {
            setBackground(LAYOUT_NAME);
            speedrun.disable();
            stage.visible = true;
            stage.paused = false;
            stage.canvas.style.display = 'block';
        },
        detached: function() {
            stage.visible = false;
            stage.paused = true;
            stage.canvas.style.display = 'none';
        }
    };
});
