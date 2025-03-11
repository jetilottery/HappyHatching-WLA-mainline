/**
 * @module game/revealAllButton
 * @description reveal all button control
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

    var autoPlay, stop, stopMTM;
    var kidsNum = 15,
        mamaNum = 5;
    var revealQueue = [];
    var kidRevealInterval, mamaRevealInterval;
    var tutorialVisible, resultScreen = false;
    var enableAutoReveal;

    function revealAll() {
        var symbol;
        var delayTime = 0;
        var mamaArray = shuffleArray([1, 2, 3, 4, 5]);
        var timer = gr.getTimer();
        msgBus.publish('disableUI');
        msgBus.publish('startRevealAll');
        var showStop = false;
        revealQueue = [];
        for (var i = 0; i < mamaNum; i++) {
            symbol = gr.lib['_mother0' + mamaArray[i]];
            if (!symbol.revealFlag) {
                showStop = true;
                symbol.off('click');
                symbol.pixiContainer.$sprite.cursor = 'auto';
                symbol.autoRevealTimer = (function(sym) {
                    return timer.setTimeout(function() {
                        sym.reveal();
                        revealQueue.shift();
                    }, delayTime);
                })(symbol);
                revealQueue.push(symbol);
                delayTime += mamaRevealInterval;
            }
        }
        for (i = 1; i <= kidsNum; i++) {
            if (i < 10) {
                symbol = gr.lib['_kids0' + i];
            } else {
                symbol = gr.lib['_kids' + i];
            }
            if (!symbol.revealFlag) {
                showStop = true;
                symbol.off('click');
                symbol.pixiContainer.$sprite.cursor = 'auto';
                symbol.autoRevealTimer = (function(sym) {
                    return timer.setTimeout(function() {
                        sym.reveal();
                        revealQueue.shift();
                    }, delayTime);
                })(symbol);
                revealQueue.push(symbol);
                delayTime += kidRevealInterval;
            }
        }
        if (showStop) {
            gr.lib._buttonStop.show(true);
        }
    }

    function shuffleArray(arr) {
        var res = [];
        for (var i = 0, len = arr.length; i < len; i++) {
            var j = Math.floor(Math.random() * arr.length);
            res[i] = arr[j];
            arr.splice(j, 1);
        }
        return res;
    }

    function stopRevealAll() {
        var timer = gr.getTimer(),
            symbol;
        for (; revealQueue.length > 0;) {
            symbol = revealQueue[0];
            timer.clearTimeout(symbol.autoRevealTimer);
            symbol.on('click', symbol.reveal);
            symbol.pixiContainer.$sprite.interactive = true;
            symbol.pixiContainer.$sprite.cursor = 'pointer';
            revealQueue.shift();
        }
        gr.lib._buttonAutoPlay.show(true);
        msgBus.publish('stopRevealAll');
        msgBus.publish('enableUI');
    }

    function onGameParametersUpdated() {
        autoPlay = new gladButton(gr.lib._buttonAutoPlay, 'buttonCommon', { 'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92, 'avoidMultiTouch': true });
        autoPlay.click(function() {
            gr.lib._buttonAutoPlay.show(false);
            audio.play('ButtonGeneric');
            revealAll();
        });
        gr.lib._autoPlayText.autoFontFitText = true;
        gr.lib._autoPlayText.setText(loader.i18n.Game.button_autoPlay);
        gameUtils.setTextStyle(gr.lib._autoPlayText, { padding: 10, stroke: "#350707", strokeThickness: 4, fill: "#ffffff" });

        stop = new gladButton(gr.lib._buttonStop, 'buttonCommon', { 'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92, 'avoidMultiTouch': true });
        stop.click(function() {
            gr.lib._buttonStop.show(false);
            stopRevealAll();
            audio.play('ButtonGeneric');
        });
        gr.lib._stopText.autoFontFitText = true;
        gr.lib._stopText.setText(loader.i18n.Game.button_stop);
        gameUtils.setTextStyle(gr.lib._stopText, { padding: 10, stroke: "#350707", strokeThickness: 4, fill: "#ffffff" });

        stopMTM = new gladButton(gr.lib._buttonStopMTM, 'buttonCommon', { 'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92, 'avoidMultiTouch': true });
        stopMTM.click(function() {
            gr.lib._buttonStopMTM.show(false);
            stopRevealAll();
            audio.play('ButtonGeneric');
        });
        gr.lib._stopMTMText.autoFontFitText = true;
        gr.lib._stopMTMText.setText(loader.i18n.Game.button_stop);
        gameUtils.setTextStyle(gr.lib._stopMTMText, { padding: 10, stroke: "#350707", strokeThickness: 4, fill: "#ffffff" });

        gr.lib._buttonAutoPlay.show(false);
        gr.lib._buttonStop.show(false);
        gr.lib._buttonStopMTM.show(false);
        if (SKBeInstant.config.customBehavior) {
            kidRevealInterval = SKBeInstant.config.customBehavior.symbolKidRevealInterval || 500;
            mamaRevealInterval = SKBeInstant.config.customBehavior.symbolMamaRevealInterval || 1000;
        } else {
            kidRevealInterval = 500;
            mamaRevealInterval = 1000;
        }
        enableAutoReveal = SKBeInstant.config.autoRevealEnabled === false ? false : true;
    }

    function onStartUserInteraction(data) {
        if (!data.scenario) {
            return;
        }
        resultScreen = false;
        if (enableAutoReveal) {
            if (!tutorialVisible) {
                gr.lib._buttonAutoPlay.show(true);
            }
        } else {
            gr.lib._buttonAutoPlay.show(false);
        }
    }

    function onReStartUserInteraction(data) {
        onStartUserInteraction(data);
    }

    function onReInitialize() {
        resultScreen = false;
        gr.lib._buttonAutoPlay.show(false);
        gr.lib._buttonStop.show(false);
        clearSymbolEventListner();
    }

    function clearSymbolEventListner() {
        for (var i = 1; i <= kidsNum; i++) {
            if (i < 10) {
                gr.lib['_kids0' + i].off('click', this.clickListner);
                gr.lib['_kids0' + i].pixiContainer.$sprite.interactive = false;
                gr.lib['_kids0' + i].pixiContainer.$sprite.cursor = 'auto';
            } else {
                gr.lib['_kids' + i].off('click', this.clickListner);
                gr.lib['_kids' + i].pixiContainer.$sprite.interactive = false;
                gr.lib['_kids' + i].pixiContainer.$sprite.cursor = 'auto';
            }
        }
        for (var j = 1; j <= mamaNum; j++) {
            gr.lib['_mother0' + j].off('click', this.clickListner);
            gr.lib['_mother0' + j].pixiContainer.$sprite.interactive = false;
            gr.lib['_mother0' + j].pixiContainer.$sprite.cursor = 'auto';
        }
    }

    function onReset() {
        onReInitialize();
    }

    function onEnterResultScreenState() {
        resultScreen = true;
    }

    function onAllRevealed() {
        gr.lib._buttonAutoPlay.show(false);
        gr.lib._buttonStop.show(false);
    }

    function onTutorialIsHide() {
        tutorialVisible = false;
        if (SKBeInstant.config.gameType === 'ticketReady' && !resultScreen && enableAutoReveal) {
            gr.lib._buttonAutoPlay.show(true);
        }
    }

    function onTutorialIsShown() {
        tutorialVisible = true;
    }

    function stopRevealAllWhenError() {
        var timer = gr.getTimer(),
            symbol;
        for (; revealQueue.length > 0;) {
            symbol = revealQueue[0];
            timer.clearTimeout(symbol.autoRevealTimer);
            revealQueue.shift();
        }
        clearSymbolEventListner();
    }
    msgBus.subscribe('jLottery.reInitialize', onReInitialize);
    msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
    msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
    msgBus.subscribe('reset', onReset);
    msgBus.subscribe('revealTheLastSymbol', onAllRevealed);
    msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
    msgBus.subscribe('tutorialIsShown', onTutorialIsShown);
    msgBus.subscribe('tutorialIsHide', onTutorialIsHide);
    msgBus.subscribe('winBoxError', stopRevealAllWhenError);
    msgBus.subscribe('jLottery.error', stopRevealAllWhenError);

    return {};
});