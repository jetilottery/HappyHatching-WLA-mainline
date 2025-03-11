/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/**
 * @module game/exitButton
 * @description exit button control
 */
define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/audioPlayer/AudioPlayerProxy',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/pixiResourceLoader/pixiResourceLoader',
    'skbJet/component/SKBeInstant/SKBeInstant',
    'skbJet/componentCRDC/gladRenderer/gladButton',
    '../game/gameUtils'
], function(msgBus, audio, gr, loader, SKBeInstant, gladButton, gameUtils) {

    var playAgain, playAgainMTM;
    var playAgainTimeout;

    function playAgainButton() {
        //msgBus.publish('jLotteryGame.playAgain');
        audio.play('ButtonGeneric');
        gr.lib._buttonPlayAgain.show(false);
        gr.lib._buttonPlayAgainMTM.show(false);
        msgBus.publish('playerWantsPlayAgain');
    }

    function onGameParametersUpdated() {
        gr.lib._playAgainText.autoFontFitText = true;
        if (SKBeInstant.config.wagerType === 'BUY') {
            gr.lib._playAgainText.setText(loader.i18n.Game.button_playAgain);
        } else {
            gr.lib._playAgainText.setText(loader.i18n.Game.button_MTMPlayAgain);
        }
        gameUtils.setTextStyle(gr.lib._playAgainText, { padding: 10, stroke: "#350707", strokeThickness: 4, fill: "#ffffff" });

        playAgain = new gladButton(gr.lib._buttonPlayAgain, "buttonCommon", { 'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92, 'avoidMultiTouch': true });
        playAgain.click(playAgainButton);
        gr.lib._buttonPlayAgain.show(false);

        gr.lib._playAgainMTMText.autoFontFitText = true;
        gr.lib._playAgainMTMText.setText(loader.i18n.Game.button_MTMPlayAgain);
        gameUtils.setTextStyle(gr.lib._playAgainMTMText, { padding: 10, stroke: "#350707", strokeThickness: 4, fill: "#ffffff" });
        playAgainMTM = new gladButton(gr.lib._buttonPlayAgainMTM, "buttonCommon", { 'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92, 'avoidMultiTouch': true });
        playAgainMTM.click(playAgainButton);
        gr.lib._buttonPlayAgainMTM.show(false);
    }

    function onReInitialize() {
        gr.lib._playAgainText.autoFontFitText = true;
        gr.lib._playAgainText.setText(loader.i18n.Game.button_playAgain);
        gameUtils.setTextStyle(gr.lib._playAgainText, { padding: 10, stroke: "#350707", strokeThickness: 4, fill: "#ffffff" });
        gr.lib._buttonPlayAgain.show(false);
        gr.lib._buttonPlayAgainMTM.show(false);
        gr.getTimer().clearTimeout(playAgainTimeout);
    }

    function onEnterResultScreenState() {
        if (SKBeInstant.config.jLotteryPhase === 2) {
            playAgainTimeout = gr.getTimer().setTimeout(function() {
                gr.lib._buttonPlayAgain.show(true);
                gr.lib._buttonPlayAgainMTM.show(true);
            }, Number(SKBeInstant.config.compulsionDelayInSeconds) * 1000);
        }
    }

    msgBus.subscribe('jLottery.reInitialize', onReInitialize);
    msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);

    return {};
});