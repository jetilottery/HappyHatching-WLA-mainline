/**
 * @module errorWarningController
 * @memberof game
 * @description
 * @author Alex Wang
 */
define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/audioPlayer/AudioPlayerProxy',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/pixiResourceLoader/pixiResourceLoader',
    'skbJet/component/SKBeInstant/SKBeInstant',
    'skbJet/componentCRDC/gladRenderer/gladButton',
    'game/gameUtils'
], function(msgBus, audio, gr, loader, SKBeInstant, gladButton, gameUtils) {
    var scaleType;
    var tutorialVisible = false;
    var resultPlaque = null;
    var showWarn = false;
    var warnMessage = null;
    var inGame = false;
    var gameError = false;
    var hasWin = false;
    var textStyle = { padding: 10, /*lineHeight: lineH,*/ dropShadow: true, dropShadowAngle: Math.PI / 6, dropShadowColor: '#510505', dropShadowAlpha: 0.2, dropShadowBlur: 4, dropShadowDistance: 2 };

    function onGameParametersUpdated() {
        scaleType = { 'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92, 'avoidMultiTouch': true };
        var continueButton = new gladButton(gr.lib._warningContinueButton, '_buttonClose', scaleType);
        var warningExitButton = new gladButton(gr.lib._warningExitButton, '_buttonClose', scaleType);
        var errorExitButton = new gladButton(gr.lib._errorExitButton, '_buttonClose', scaleType);
        var winBoxExitButton = new gladButton(gr.lib._winBoxExitButton, '_buttonClose', scaleType);
        
        if (gr.lib._warningAndError) {
            gr.lib._warningAndError.show(false);
        }
        if (gr.lib._winBoxError) {
            gr.lib._winBoxError.show(false);
        }
        gr.lib._warningText.autoFontFitText = false;
        gr.lib._errorText.autoFontFitText = false;

        gr.lib._errorExitText.autoFontFitText = true;
        gr.lib._errorExitText.setText(loader.i18n.Game.error_button_exit);

        gr.lib._warningContinueText.autoFontFitText = true;
        gr.lib._warningContinueText.setText(loader.i18n.Game.button_continue);

        gr.lib._warningExitText.autoFontFitText = true;
        gr.lib._warningExitText.setText(loader.i18n.Game.warning_button_exitGame);

        gr.lib._winBoxExitText.autoFontFitText = true;
        gr.lib._winBoxExitText.setText(loader.i18n.Game.button_exit);

        var btnTextStyle = { padding: 10, stroke: "#350707", strokeThickness: 4, fill: "#ffffff" /*, dropShadow: true, dropShadowDistance: 2.5*/ };
        gameUtils.setTextStyle(gr.lib._errorExitText, btnTextStyle);
        gameUtils.setTextStyle(gr.lib._warningContinueText, btnTextStyle);
        gameUtils.setTextStyle(gr.lib._warningExitText, btnTextStyle);
        gameUtils.setTextStyle(gr.lib._winBoxExitText, btnTextStyle);
        gameUtils.setTextAlignCenter(gr.lib._errorExitText);
        gameUtils.setTextAlignCenter(gr.lib._warningContinueText);
        gameUtils.setTextAlignCenter(gr.lib._warningExitText);
        gameUtils.setTextAlignCenter(gr.lib._winBoxExitText);

        gr.lib._errorTitle.show(true);
        gr.lib._errorTitle.autoFontFitText = true;
        gr.lib._errorTitle.setText(loader.i18n.Game.error_title);
        gameUtils.setTextStyle(gr.lib._errorTitle, { padding: 10, stroke: "#f7ba5b", fontWeight: 600, strokeThickness: 4 });

        errorExitButton.click(function() {
            msgBus.publish('jLotteryGame.playerWantsToExit');
            audio.play('ButtonGeneric');
        });
        continueButton.click(closeErrorWarn);
        warningExitButton.click(function() {
            msgBus.publish('jLotteryGame.playerWantsToExit');
            audio.play('ButtonGeneric');
        });
        winBoxExitButton.click(function() {
            msgBus.publish('jLotteryGame.playerWantsToExit');
            audio.play('ButtonGeneric');
        });
    }

    function onWarn(warning) {
        if (gr.lib._warningAndError) {
            gr.lib._warningAndError.show(true);
        }

        gr.lib._buttonInfo.show(false);
        gr.lib._BG_dim.show(true);
        if (gr.lib._tutorial.pixiContainer.visible) {
            gr.lib._tutorial.show(false);
            tutorialVisible = true;
        }

        resultPlaque = hasWin ? gr.lib._winPlaque : gr.lib._nonWinPlaque;

        if (resultPlaque.pixiContainer.visible) {
            resultPlaque.show(false);
        } else {
            resultPlaque = null;
        }

        msgBus.publish('tutorialIsShown');
        gr.lib._errorTitle.show(false);
        gr.lib._warningTitle.show(true);
        gr.lib._warningText.show(true);
        gr.lib._warningText.setText(warning.warningMessage);
        gameUtils.fontFitForVerticalOverflow(gr.lib._warningText);
        gameUtils.setTextStyle(gr.lib._warningText, textStyle);
        gr.lib._warningExitButton.show(true);
        gr.lib._warningContinueButton.show(true);
        gr.lib._errorExitButton.show(false);

    }

    function destroyBypassGameExit() {
        audio.muteAll(true);
        var targetDiv = document.getElementById(SKBeInstant.config.targetDivId);
        if (targetDiv) {
            targetDiv.innerHTML = "";
            targetDiv.style.background = '';
            targetDiv.style.backgroundSize = '';
            targetDiv.style.webkitUserSelect = '';
            targetDiv.style.webkitTapHighlightColor = '';
        }
        //clear require cache
        if (window.loadedRequireArray) {
            for (var i = window.loadedRequireArray.length - 1; i >= 0; i--) {
                requirejs.undef(window.loadedRequireArray[i]);
            }
        }
    }

    function closeErrorWarn() {
        if (gr.lib._warningAndError) {
            gr.lib._warningAndError.show(false);
        }

        if (tutorialVisible || resultPlaque) {
            if (tutorialVisible) {
                gr.lib._tutorial.show(true);
                tutorialVisible = false;
            } else {
                resultPlaque.show(true);
                resultPlaque = null;
                msgBus.publish('tutorialIsHide');
            }
        } else {
            gr.lib._BG_dim.show(false);
            msgBus.publish('tutorialIsHide');
        }
        audio.play('ButtonGeneric');
        if (gameError) {
            gameError = false;
        }
    }

    function onError(error) {
        gameError = true;

        gr.lib._buttonInfo.show(false);
        gr.lib._BG_dim.show(true);

        if (gr.lib._tutorial.pixiContainer.visible) {
            gr.lib._tutorial.show(false);
            tutorialVisible = true;
        }
        msgBus.publish('tutorialIsShown');
        gr.lib._warningTitle.show(false);
        gr.lib._errorTitle.show(true);
        gr.lib._errorText.show(true);
        gr.lib._errorText.setText(error.errorCode + ": " + error.errorDescriptionSpecific + "\n" + error.errorDescriptionGeneric);
        gameUtils.fontFitForVerticalOverflow(gr.lib._errorText);
        gameUtils.setTextStyle(gr.lib._errorText, textStyle);
        gr.lib._warningExitButton.show(false);
        gr.lib._warningContinueButton.show(false);
        gr.lib._errorExitButton.show(true);
        gr.lib._warningAndError.show(true);

        //When error happend, Sound must be silenced.
        audio.stopAllChannel();
        if (error.errorCode === '00000' || error.errorCode === '66605') {
            destroyBypassGameExit();
            return;
        }
    }

    function onWinBoxError(error) {
        audio.stopAllChannel();
        gr.lib._BG_dim.show(true);
        msgBus.publish('tutorialIsShown');
        //if (error.errorCode === '29000') {
        //  gr.lib._winBoxError.show(true);
        //gr.lib._winBoxErrorText.setText(error.errorCode);
        //gameUtils.setTextStyle(gr.lib._winBoxErrorText, textStyle);
        //}

        if (error.errorCode === '29000') {
            if (gr.lib._winBoxError) {
                gr.lib._winBoxError.show(true);
            }
            gr.lib._winBoxErrorText.setText(loader.i18n.Error.error29000);
            if (SKBeInstant.isWLA()) {
                gr.lib._winBoxExitButton.show(true);
            } else {
                gr.lib._winBoxExitButton.show(false);
            }
        } else {
            if (gr.lib._warningAndError) {
                gr.lib._warningAndError.show(true);
            }
            gr.lib._errorTitle.show(true);
            gr.lib._buttonInfo.show(false);

            gr.lib._warningText.show(false);
            gr.lib._errorText.show(true);
            gr.lib._errorText.setText(error.errorCode + ": " + error.errorDescriptionSpecific + "\n" + error.errorDescriptionGeneric);
            gr.lib._warningExitButton.show(false);
            gr.lib._warningContinueButton.show(false);
            gr.lib._errorExitButton.show(true);
        }
    }

    function onEnterResultScreenState() {
        inGame = false;
        if (showWarn) {
            showWarn = false;
            gr.getTimer().setTimeout(function() {
                onWarn(warnMessage);
            }, (Number(SKBeInstant.config.compulsionDelayInSeconds) + 0.3) * 1000);
        }
    }

    msgBus.subscribe('jLottery.reInitialize', function() {
        inGame = false;
    });

    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
    msgBus.subscribe('jLottery.error', onError);
    msgBus.subscribe('winBoxError', onWinBoxError);
    msgBus.subscribe('buyOrTryHaveClicked', function(data) {
        inGame = data;
    });
    msgBus.subscribe('jLottery.playingSessionTimeoutWarning', function(warning) {
        if (SKBeInstant.config.jLotteryPhase === 1 || gameError) {
            return;
        }

        if (inGame) {
            warnMessage = warning;
            showWarn = true;
        } else {
            onWarn(warning);
        }
    });

    function onStartUserInteraction(data) {
        inGame = true;
        hasWin = (data.playResult === 'WIN');
    }

    function onReStartUserInteraction(data) {
        onStartUserInteraction(data);
    }

    msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
    msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
    msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
    return {};
});