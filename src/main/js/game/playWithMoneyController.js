/**
 * @module game/playWithMoney
 * @description play with money button control
 */
define([
	'skbJet/component/gameMsgBus/GameMsgBus',
	'skbJet/component/audioPlayer/AudioPlayerProxy',
	'skbJet/component/gladPixiRenderer/gladPixiRenderer',
	'skbJet/component/pixiResourceLoader/pixiResourceLoader',
	'skbJet/component/SKBeInstant/SKBeInstant',
    'skbJet/componentCRDC/gladRenderer/gladButton',
    '../game/gameUtils'
], function (msgBus, audio, gr, loader, SKBeInstant, gladButton, gameUtils) {
    var count = 0;
    var buttonMTM;
	var tutorialVisible;
	var inGame = false;

	function enableButton() {
		if ((SKBeInstant.config.wagerType === 'BUY') || (SKBeInstant.config.jLotteryPhase === 1) || (Number(SKBeInstant.config.demosB4Move2MoneyButton) === -1/*-1: never. Move-To-Money-Button will never appear.*/)) {
			gr.lib._buy.show(true);
            gr.lib._try.show(false);
		} else {
			//0: Move-To-Money-Button shown from the beginning, before placing any demo wager.
			//1..N: number of demo wagers before showing Move-To-Money-Button.
			//(Example: If value is 1, then the first time the RESULT_SCREEN state is reached, 
			//the Move-To-Money-Button will appear (conditioned by compulsionDelayInSeconds))
			if (count >= Number(SKBeInstant.config.demosB4Move2MoneyButton)){
				gr.lib._buy.show(false);
                gr.lib._try.show(true);
				gr.lib._buttonMTM.show(true);
            }else{
                gr.lib._buy.show(true);
                gr.lib._try.show(false);
            }
		}
	}

	function onStartUserInteraction() {
		inGame = true;
		if(SKBeInstant.config.gameType === 'normal'){
			gr.lib._buy.show(true);
            gr.lib._try.show(false);
		}
	}

	function onReStartUserInteraction() {
		inGame = true;
		gr.lib._buy.show(true);
        gr.lib._try.show(false);
	}

	function onDisableUI() {
		gr.lib._buttonMTM.show(false);
	}
    
    function onEnableUI(){
		gr.lib._buttonMTM.show(true);
    }
	
    function onGameParametersUpdated(){
		var style = {padding:10, stroke:"#350707", strokeThickness:4, fill:"#ffffff"};
		var scaleType = {'scaleXWhenClick': 0.92,'scaleYWhenClick': 0.92,'avoidMultiTouch':true};
        buttonMTM = new gladButton(gr.lib._buttonMTM, 'buttonCommon', scaleType);
		gr.lib._MTMText.autoFontFitText = true;
        gr.lib._MTMText.setText(loader.i18n.Game.button_move2moneyGame);
        gameUtils.setTextStyle(gr.lib._MTMText, style);
		gameUtils.setTextAlignCenter(gr.lib._MTMText);
		
		function clickMTM(){
			gr.lib._try.show(false); 
			SKBeInstant.config.wagerType = 'BUY';
			msgBus.publish('disableTicketCost');
			msgBus.publish('jLotteryGame.playerWantsToMoveToMoneyGame');
			audio.play('ButtonGeneric');
		}

		buttonMTM.click(clickMTM);
	}
    
    function onEnterResultScreenState(){
        count++;
		inGame = false;
        gr.getTimer().setTimeout(function () {
            enableButton();
        }, Number(SKBeInstant.config.compulsionDelayInSeconds) * 1000);
    }
    
    function onReInitialize(){
		inGame = false;
        enableButton();
    }
    
    function onTutorialIsShown(){
        gr.lib._try.show(false);
        gr.lib._buy.show(false);
		gr.lib._buttonMTM.show(false);
		tutorialVisible = true;
    }
    
    function onTutorialIsHide(){
		tutorialVisible = false;
		if(inGame){
			gr.lib._buy.show(true);
			gr.lib._try.show(false);
		}else{
			enableButton();
		}
    }
	
	msgBus.subscribe('jLotterySKB.reset', onReInitialize);
    msgBus.subscribe('jLottery.reInitialize', onReInitialize);
    msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
	msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
	msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
	msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
	msgBus.subscribe('disableUI', onDisableUI);
    msgBus.subscribe('enableUI', onEnableUI);
    msgBus.subscribe('tutorialIsShown', onTutorialIsShown);
    msgBus.subscribe('tutorialIsHide', onTutorialIsHide);
	msgBus.subscribe('revealTheLastSymbol', onDisableUI);

	return {};
});