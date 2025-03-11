/**
 * @module game/exitButton
 * @description exit button control
 */
define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/audioPlayer/AudioPlayerProxy',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/pixiResourceLoader/pixiResourceLoader',
    'skbJet/component/SKBeInstant/SKBeInstant'
], function(msgBus, audio, gr, loader, SKBeInstant) {

    function exitButton() {
        audio.play('ButtonGeneric');
        msgBus.publish('jLotteryGame.playerWantsToExit');
    }

    function onGameParametersUpdated() {
        gr.lib._textExit._currentStyle._text._padding = 10;
        gr.lib._textExit.pixiContainer.$text.style.padding = 10;
        gr.lib._textExit.autoFontFitText = true;
        gr.lib._textExit.setText(loader.i18n.button_exit);
        gr.lib._buttonExit.on('click', exitButton);
        gr.lib._buttonExitII.on('click', exitButton);
        gr.lib._buttonExitII.show(false);
    }

    function onEnterResultScreenState() {
        if (SKBeInstant.config.jLotteryPhase === 1) {
            gr.lib._buttonExitII.show(true);
        }
    }

    function onDisableUI() {
        gr.lib._buttonExit.show(false);
    }

    function onEnableUI() {
        gr.lib._buttonExit.show(true);
    }

    msgBus.subscribe('disableUI', onDisableUI);
    msgBus.subscribe('enableUI', onEnableUI);
    msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);

    return {};
});