/**
 * @module game/meters
 * @description meters control
 */
define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/pixiResourceLoader/pixiResourceLoader',
    'skbJet/component/SKBeInstant/SKBeInstant',
    'skbJet/component/currencyHelper/currencyHelper',
    '../game/gameUtils'
], function(msgBus, gr, loader, SKBeInstant, currencyHelper, gameUtils) {

    var resultData = null;
    var MTMReinitial = false;

    function onStartUserInteraction(data) {
        resultData = data;
    }

    function onEnterResultScreenState() {
        if (resultData.playResult === 'WIN' || SKBeInstant.isWLA()) {
            gr.lib._winsValue.setText(SKBeInstant.formatCurrency(resultData.prizeValue).formattedAmount);
            gameUtils.fixMeter(gr);
        }
    }

    function onReStartUserInteraction(data) {
        onStartUserInteraction(data);
    }

    function onReInitialize() {
        if (MTMReinitial && SKBeInstant.config.balanceDisplayInGame) {
            gr.lib._balanceText.show(true);
            gr.lib._balanceValue.show(true);
            gr.lib._meterDivision0.show(true);
        }
        gr.lib._winsValue.setText(SKBeInstant.config.defaultWinsValue);
        gameUtils.fixMeter(gr);
    }

    function onUpdateBalance(data) {
        if (SKBeInstant.config.balanceDisplayInGame) {
            if (SKBeInstant.isSKB()) {
                gr.lib._balanceValue.setText(currencyHelper.formatBalance(data.balance));
            } else {
                gr.lib._balanceValue.setText(data.formattedBalance);
            }
            gameUtils.fixMeter(gr);
        }
    }

    function onGameParametersUpdated() {
        if (SKBeInstant.config.balanceDisplayInGame === false || SKBeInstant.config.wagerType === 'TRY') {
            gr.lib._balanceValue.show(false);
            gr.lib._balanceText.show(false);
            gr.lib._meterDivision0.show(false);
        }

        var balanceText = SKBeInstant.isWLA() ? loader.i18n.Game.balance.toUpperCase() : loader.i18n.Game.balance;
        gr.lib._winsText.autoFontFitText = true;
        gr.lib._ticketCostMeterText.autoFontFitText = true;
        gr.lib._balanceText.autoFontFitText = true;
        gameUtils.setTextStyle(gr.lib._balanceText, { padding: 10 });
        gr.lib._balanceText.setText(balanceText + ' ');
        gameUtils.setTextStyle(gr.lib._balanceValue, { padding: 10 });
        if (!SKBeInstant.isSKB()) {
            gr.lib._balanceValue.setText('');
        }

        gameUtils.setTextStyle(gr.lib._winsText, { padding: 10 });
        gameUtils.setTextStyle(gr.lib._winsValue, { padding: 10 });
        gameUtils.setTextStyle(gr.lib._ticketCostMeterText, { padding: 10 });
        gameUtils.setTextStyle(gr.lib._ticketCostMeterValue, { padding: 10 });
        gameUtils.setTextStyle(gr.lib._meterDivision0, { padding: 10 });
        gameUtils.setTextStyle(gr.lib._meterDivision1, { padding: 10 });

        var meterWager = SKBeInstant.isWLA() ? loader.i18n.Game.meter_wager.toUpperCase() : loader.i18n.Game.meter_wager;
        gr.lib._ticketCostMeterText.setText(meterWager + ' ');

        gr.lib._meterDivision0.setText(loader.i18n.Game.meter_division);
        gr.lib._meterDivision1.setText(loader.i18n.Game.meter_division);

        gr.lib._winsValue.setText(SKBeInstant.config.defaultWinsValue);

        gameUtils.fixMeter(gr);
        gr.forceRender();
    }

    function onTicketCostChanged(prizePoint) {
        if (SKBeInstant.config.wagerType === 'BUY') {
            var wins = SKBeInstant.isWLA() ? loader.i18n.Game.wins.toUpperCase() : loader.i18n.Game.wins;
            gr.lib._winsText.setText(wins + ' ');
            gr.lib._ticketCostMeterValue.setText(SKBeInstant.formatCurrency(prizePoint).formattedAmount);
        } else {
            var wins_demo = SKBeInstant.isWLA() ? loader.i18n.Game.wins_demo.toUpperCase() : loader.i18n.Game.wins_demo;
            gr.lib._winsText.setText(wins_demo + ' ');
            gr.lib._ticketCostMeterValue.setText(loader.i18n.Game.demo + ' ' + SKBeInstant.formatCurrency(prizePoint).formattedAmount);
        }
        gameUtils.fixMeter(gr);
    }

    function onPlayerWantsPlayAgain() {
        gr.lib._winsValue.setText(SKBeInstant.config.defaultWinsValue);
        gameUtils.fixMeter(gr);
    }

    function onBeforeShowStage(data) {
        gr.lib._balanceValue.setText(currencyHelper.formatBalance(data.response.Balances["@totalBalance"]));
        gameUtils.fixMeter(gr);
        gr.forceRender();
    }

    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
    msgBus.subscribe('jLottery.reInitialize', onReInitialize);
    msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
    msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
    msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
    msgBus.subscribe('jLottery.updateBalance', onUpdateBalance);
    msgBus.subscribe('ticketCostChanged', onTicketCostChanged);
    msgBus.subscribe('playerWantsPlayAgain', onPlayerWantsPlayAgain);
    msgBus.subscribe('onBeforeShowStage', onBeforeShowStage);
    msgBus.subscribe('jLotteryGame.playerWantsToMoveToMoneyGame', function() {
        MTMReinitial = true;
    });
    msgBus.subscribe('winBoxError', function() {
        gr.lib._winsValue.setText(SKBeInstant.config.defaultWinsValue);
        gameUtils.fixMeter(gr);
    });

    return {};
});