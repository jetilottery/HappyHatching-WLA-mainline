/**
 * @module game/buyAndTryController
 * @description buy and try button control
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

    var currentTicketCost = null;
    var replay, tryButton, buyButton;
    var MTMReinitial = false;

    function onGameParametersUpdated() {
        gr.lib._loadingIcon.stopPlay();
        gr.lib._loadingIcon.show(false);
        tryButton = new gladButton(gr.lib._buttonTry, "buttonCommon", { 'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92, 'avoidMultiTouch': true });
        buyButton = new gladButton(gr.lib._buttonBuy, "buttonCommon", { 'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92, 'avoidMultiTouch': true });
        gr.lib._buttonBuy.show(false);
        gr.lib._buttonTry.show(false);
        replay = false;
        gr.lib._buyText.autoFontFitText = true;
        if (SKBeInstant.config.wagerType === 'BUY') {
            gr.lib._buyText.setText(loader.i18n.Game.button_buy);
        } else {
            gr.lib._buyText.setText(loader.i18n.Game.button_try);
        }
        gameUtils.setTextStyle(gr.lib._buyText, { fontSize: 28, padding: 10, stroke: "#350707", strokeThickness: 4, fill: "#ffffff" });
        gr.lib._tryText.autoFontFitText = true;
        gr.lib._tryText.setText(loader.i18n.Game.button_try);
        gameUtils.setTextStyle(gr.lib._tryText, { fontSize: 28, padding: 10, stroke: "#350707", strokeThickness: 4, fill: "#ffffff" });

        tryButton.click(buyOrTryClickEvent);
        buyButton.click(buyOrTryClickEvent);
    }

    function play() {
        msgBus.publish('hideSessionTimeoutScreen', true);
        gr.lib._loadingIcon.show(true);
        gr.lib._loadingIcon.gotoAndPlay('networkActivity', 0.2, true);
        if (replay) {
            msgBus.publish('jLotteryGame.playerWantsToRePlay', { price: currentTicketCost });
        } else {
            msgBus.publish('jLotteryGame.playerWantsToPlay', { price: currentTicketCost });
        }
        gr.lib._buttonBuy.show(false);
        gr.lib._buttonTry.show(false);
        gr.lib._buttonMTM.show(false);
        audio.play('ButtonGeneric');
        msgBus.publish('disableUI');
        msgBus.publish('disableTicketCost');
    }

    function buyOrTryClickEvent() {
        msgBus.publish('buyOrTryHaveClicked');
        play();
    }

    function onStartUserInteraction(data) {
        gr.lib._buttonBuy.show(false);
        gr.lib._buttonTry.show(false);
        currentTicketCost = data.price;
        replay = true;
    }

    function showBuyOrTryButton() {
        if (SKBeInstant.config.jLotteryPhase !== 2) {
            return;
        }
        gr.lib._buttonBuy.show(true);
        gr.lib._buttonTry.show(true);
    }

    function onInitialize() {
        showBuyOrTryButton();
    }

    function onTicketCostChanged(data) {
        currentTicketCost = data;
    }

    function onReInitialize() {
        if (MTMReinitial) {
            replay = false;
            gr.lib._buyText.autoFontFitText = true;
            gr.lib._buyText.setText(loader.i18n.Game.button_buy);
            gameUtils.setTextStyle(gr.lib._buyText, { fontSize: 28, padding: 10, stroke: "#350707", strokeThickness: 4, fill: "#ffffff" });
            MTMReinitial = false;
        }
        gr.lib._loadingIcon.stopPlay();
        gr.lib._loadingIcon.show(false);
        showBuyOrTryButton();
    }

    function onPlayerWantsPlayAgain() {
        showBuyOrTryButton();
    }

    function onReset() {
        gr.lib._loadingIcon.stopPlay();
        gr.lib._loadingIcon.show(false);
        showBuyOrTryButton();
    }

    function onPlayerWantsToMoveToMoneyGame() {
        MTMReinitial = true;
    }
    msgBus.subscribe('jLotterySKB.reset', onReset);
    msgBus.subscribe("playerWantsPlayAgain", onPlayerWantsPlayAgain);
    msgBus.subscribe('jLottery.reInitialize', onReInitialize);
    msgBus.subscribe('jLottery.initialize', onInitialize);
    msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
    msgBus.subscribe('ticketCostChanged', onTicketCostChanged);
    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
    msgBus.subscribe('jLotteryGame.playerWantsToMoveToMoneyGame', onPlayerWantsToMoveToMoneyGame);
    return {};
});