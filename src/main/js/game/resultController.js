/**
 * @module game/resultDialog
 * @description result dialog control
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
    var winClose, nonWinClose;
    var tutorialVisible;
    var resultData = null;
    var resultMsgStyle = { padding: 10, fill: ["#ff6e02", "#fff119", "#ffff00", "#ff6d00"], stroke: "#462403", strokeThickness: 4, dropShadow: true, dropShadowColor: '#310101', dropShadowAlpha: 0.2, dropShadowBlur: 2, dropShadowDistance: 3 };
    var inResultScreenState = false;

    function onGameParametersUpdated() {
        winClose = new gladButton(gr.lib._buttonWinClose, "buttonClose", { 'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92, 'avoidMultiTouch': true });
        nonWinClose = new gladButton(gr.lib._buttonNonWinClose, "buttonClose", { 'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92, 'avoidMultiTouch': true });

        function closeResultPlaque() {
            if (tutorialVisible) {
                return;
            }
            inResultScreenState = false;
            hideDialog();
            audio.play('ButtonGeneric');
        }
        winClose.click(closeResultPlaque);
        nonWinClose.click(closeResultPlaque);
        gr.lib._win_Text.autoFontFitText = true;
        gr.lib._win_Text.setText(loader.i18n.Game.message_buyWin);
        gameUtils.setTextStyle(gr.lib._win_Text, resultMsgStyle);

        gr.lib._win_Try_Text.autoFontFitText = true;
        if (SKBeInstant.config.wagerType === 'TRY' && Number(SKBeInstant.config.demosB4Move2MoneyButton) === -1) {
            gr.lib._win_Try_Text.setText(loader.i18n.Game.message_anonymous_tryWin);
        } else {
            gr.lib._win_Try_Text.setText(loader.i18n.Game.message_tryWin);
        }
        gameUtils.setTextStyle(gr.lib._win_Try_Text, resultMsgStyle);

        gr.lib._closeWinText.autoFontFitText = true;
        gr.lib._closeWinText.setText(loader.i18n.Game.message_close);
        gameUtils.setTextStyle(gr.lib._closeWinText, { padding: 10, stroke: "#360303", strokeThickness: 4 });

        gr.lib._nonWin_Text.autoFontFitText = true;
        gr.lib._nonWin_Text.setText(loader.i18n.Game.message_nonWin);
        gameUtils.setTextStyle(gr.lib._nonWin_Text, resultMsgStyle);

        gr.lib._closeNonWinText.autoFontFitText = true;
        gr.lib._closeNonWinText.setText(loader.i18n.Game.message_close);
        gameUtils.setTextStyle(gr.lib._closeNonWinText, { padding: 10, stroke: "#360303", strokeThickness: 4 });

        hideDialog();
    }

    function hideDialog() {
        if (!tutorialVisible) {
            gr.lib._BG_dim.show(false);
        }
        gr.lib._winPlaque.show(false);
        gr.lib._nonWinPlaque.show(false);
        msgBus.publish('resultDialogIsHide');
    }

    function showDialog() {
        gr.lib._BG_dim.show(true);
        if (resultData.playResult === 'WIN') {
            if (SKBeInstant.config.wagerType === 'BUY') {
                gr.lib._win_Try_Text.show(false);
                gr.lib._win_Text.show(true);
            } else {
                gr.lib._win_Try_Text.show(true);
                gr.lib._win_Text.show(false);
            }
            gr.lib._win_Value.autoFontFitText = true;
            gr.lib._win_Value.setText(SKBeInstant.formatCurrency(resultData.prizeValue).formattedAmount);
            gameUtils.setTextStyle(gr.lib._win_Value, resultMsgStyle);
            gr.lib._winPlaque.show(true);
            gr.lib._nonWinPlaque.show(false);
        } else {
            gr.lib._winPlaque.show(false);
            gr.lib._nonWinPlaque.show(true);
        }
        msgBus.publish('resultDialogIsShown');
    }

    function onStartUserInteraction(data) {
        resultData = data;
    }

    function onAllRevealed() {
        msgBus.publish('jLotteryGame.ticketResultHasBeenSeen', {
            tierPrizeShown: resultData.prizeDivision,
            formattedAmountWonShown: resultData.prizeValue
        });
    }

    function onEnterResultScreenState() {
        inResultScreenState = true;
        showDialog();
    }

    function onReStartUserInteraction(data) {
        onStartUserInteraction(data);
    }

    function onReInitialize() {
        inResultScreenState = false;
        hideDialog();
    }

    function onPlayerWantsPlayAgain() {
        inResultScreenState = false;
        hideDialog();
    }

    function onTutorialIsHide() {
        tutorialVisible = false;
        if (inResultScreenState) {
            if (resultData.playResult === 'WIN') {
                gr.lib._winPlaque.show(true);
                gr.lib._nonWinPlaque.show(false);
            } else {
                gr.lib._winPlaque.show(false);
                gr.lib._nonWinPlaque.show(true);
            }
        }
    }

    function onTutorialIsShown() {
        tutorialVisible = true;
        gr.lib._winPlaque.show(false);
        gr.lib._nonWinPlaque.show(false);
    }
    msgBus.subscribe('jLottery.reInitialize', onReInitialize);
    msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
    msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
    msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
    msgBus.subscribe('allKidAndMamaRevealed', onAllRevealed);
    msgBus.subscribe('playerWantsPlayAgain', onPlayerWantsPlayAgain);
    msgBus.subscribe('tutorialIsShown', onTutorialIsShown);
    msgBus.subscribe('tutorialIsHide', onTutorialIsHide);
    return {};
});