/**
 * @module game/tutorialController
 * @description result dialog control
 */
define([
	'com/pixijs/pixi',
	'skbJet/component/gameMsgBus/GameMsgBus',
	'skbJet/component/SKBeInstant/SKBeInstant',
	'skbJet/component/audioPlayer/AudioPlayerProxy',
	'skbJet/component/gladPixiRenderer/gladPixiRenderer',
	'skbJet/component/pixiResourceLoader/pixiResourceLoader',
	'skbJet/componentCRDC/gladRenderer/gladButton',
	'../game/gameUtils'
], function (PIXI, msgBus, SKBeInstant, audio, gr, loader, gladButton, gameUtils) {
	var buttonInfo, buttonClose;
	var left, right;
	var index = 0, minIndex = 0, maxIndex = 4;
	var resultIsShown = false, tutorialVisible;
	var channelNum = 3;
    var ButtonBetUpChannel = 0;
    var ButtonBetDownChannel = 0;
	var shouldShowTutorialWhenReinitial = false;
	var showTutorialAtBeginning = true;
	var showButtonInfoTimer = null;

	function showTutorial() {
		gr.lib._BG_dim.off('click');
		buttonInfo.show(false);
		gr.lib._BG_dim.show(true);
        gr.lib._tutorial.show(true);
		tutorialVisible = true;
		index = minIndex;
		if (gr.lib._winPlaque.pixiContainer.visible || gr.lib._nonWinPlaque.pixiContainer.visible) {
            resultIsShown = true;
        }
		gr.animMap._tutorialAnim.play();
		msgBus.publish('tutorialIsShown');
	}

	function hideTutorial() {
		index = minIndex;
		gr.animMap._tutorialUP._onComplete = function(){
			tutorialVisible = false;
			gr.lib._tutorial.show(false);
            for (var i = minIndex; i <= maxIndex; i++) {
                if (i === minIndex) {
                    gr.lib['_tutorialPage_0' + i].show(true);
                    gr.lib['_tutorialPage_0'+i+'_Text_00'].show(true);
                    gr.lib['_tutorialPageIcon_0' + i].setImage('tutorialPageIconOn');
                } else {
                    gr.lib['_tutorialPage_0' + i].show(false);
                    gr.lib['_tutorialPage_0'+i+'_Text_00'].show(false);
                    gr.lib['_tutorialPageIcon_0' + i].setImage('tutorialPageIconOff');
                }
            }
            buttonInfo.show(true);
            if (!resultIsShown) {
                gr.lib._BG_dim.show(false);
            }else{
                resultIsShown = false;
            }
			msgBus.publish('tutorialIsHide');
		};
		gr.animMap._tutorialUP.play();
	}
	function showHideInfoButton(visible){
		if(visible){
			if(tutorialVisible){
				buttonInfo.show(false);
			}else{
				buttonInfo.show(true);
			}
		}else{
			buttonInfo.show(false);
		}
	}
	function onGameParametersUpdated() {
		gr.lib._versionText.autoFontFitText = true;
        gr.lib._versionText.setText(window._cacheFlag.gameVersion);
		
		gr.lib._BG_dim.on('click', function(event){
            event.stopPropagation();
        });
		
		prepareAudio();
		buttonInfo = new gladButton(gr.lib._buttonInfo, "buttonInfo",{'scaleXWhenClick': 0.92,'scaleYWhenClick': 0.92,'avoidMultiTouch':true});
		buttonClose = new gladButton(gr.lib._buttonCloseTutorial, "buttonClose",{'scaleXWhenClick': 0.92,'scaleYWhenClick': 0.92,'avoidMultiTouch':true});
		left = new gladButton(gr.lib._buttonTutorialArrowLeft, "buttonTutorialArrow",{'avoidMultiTouch':true});
		right = new gladButton(gr.lib._buttonTutorialArrowRight, "buttonTutorialArrow",{'avoidMultiTouch':true});
		
		if(SKBeInstant.config.customBehavior){
            if(SKBeInstant.config.customBehavior.showTutorialAtBeginning === false){
                showTutorialAtBeginning = false;
                buttonInfo.show(true);
                gr.lib._BG_dim.show(false);
                gr.lib._tutorial.show(false);
            }
        }
		
		buttonInfo.click(function () {
			showTutorial();
			audio.play('ButtonGeneric');
		});

		buttonClose.click(function () {
			hideTutorial();
			audio.play('ButtonGeneric');
		});

		left.click(function () {
			index--;
			if(index < minIndex){
				index = maxIndex;
			}
			showTutorialPageByIndex(index);
			audio.play('ButtonBetDown', 'ButtonBetDown' + (ButtonBetDownChannel % channelNum));
			ButtonBetDownChannel++;
		});
		right.click(function () {
			index++;
			if(index > maxIndex){
				index = minIndex;
			}
			showTutorialPageByIndex(index);
			audio.play('ButtonBetUp', 'ButtonBetUp' + (ButtonBetUpChannel % channelNum));
			ButtonBetUpChannel++;
		});

		gr.lib._tutorialTitleText.autoFontFitText = true;
		gr.lib._tutorialTitleText.setText(loader.i18n.Game.tutorial_title);
		var tutorialContent = SKBeInstant.isWLA()?loader.i18n.Game.tutorial.WLA:loader.i18n.Game.tutorial.Commercial;
		if(!tutorialContent){
			tutorialContent = loader.i18n.Game.tutorial;
		}
		gameUtils.setTextStyle(gr.lib._tutorialTitleText,{padding:10, stroke:"#f7ba5b", fontWeight: 600, strokeThickness:4});
		var orientation = SKBeInstant.getGameOrientation();
		var lineH = 26;
		if(orientation === 'portrait'){
			lineH = 20;
		}
		var txtStyle = {align: 'center', fontWeight: 600, fill: '#3f080c', dropShadow: true, dropShadowAngle: Math.PI / 6, dropShadowColor: '#510505', dropShadowAlpha: 0.2, dropShadowBlur: 4, dropShadowDistance: 2, wordWrap: true};
		for (var i = minIndex; i <= maxIndex; i++) {
			if(i !== 0){
				gr.lib['_tutorialPage_0' + i].show(false);
				gr.lib['_tutorialPage_0' + i + '_Text_00'].show(false);
			}
			var obj = gr.lib['_tutorialPage_0' + i + '_Text_00'];
			obj.pixiContainer.removeChildren();
			var size = obj._currentStyle._font._size;
			txtStyle.fontSize = size;
			txtStyle.wordWrapWidth = obj._currentStyle._width;
			txtStyle.lineHeight = lineH;
			var txt = tutorialContent['tutorial_0' + i];
			var txtSprite = new PIXI.Text(txt, txtStyle);
			while(txtSprite.height > obj._currentStyle._height){
				size--;
				if(size < 16){
					break;
				}
				txtStyle.fontSize = size;
				txtSprite = new PIXI.Text(txt, txtStyle);
			}
			while(txtSprite.height > obj._currentStyle._height){
				txtStyle.lineHeight--;
				if(txtStyle.lineHeight < 16){
					break;
				}
				txtSprite = new PIXI.Text(txt, txtStyle);
			}
			txtSprite.x = (obj._currentStyle._width - txtSprite.width)/2;
			obj.pixiContainer.addChild(txtSprite);
		}

		gr.lib._closeTutorialText.autoFontFitText = true;
		gr.lib._closeTutorialText.setText(loader.i18n.Game.message_close);
		gameUtils.setTextStyle(gr.lib._closeTutorialText,{padding:10, stroke:"#330000", strokeThickness:5});
		//showTutorial();
	}
	function showTutorialPageByIndex(index){
		hideAllTutorialPages();
		gr.lib['_tutorialPage_0' + index].show(true);
		gr.lib['_tutorialPage_0'+ index +'_Text_00'].show(true);
		gr.lib['_tutorialPageIcon_0'+index].setImage('tutorialPageIconOn');
	}
	function hideAllTutorialPages(){
		for (var i = 0; i <= maxIndex; i++){
			gr.lib['_tutorialPage_0' + i].show(false);
			gr.lib['_tutorialPage_0'+ i +'_Text_00'].show(false);
			gr.lib['_tutorialPageIcon_0'+i].setImage('tutorialPageIconOff');
		}
	}

	function onReInitialize() {
		if(shouldShowTutorialWhenReinitial){
			shouldShowTutorialWhenReinitial = false;
			if(showTutorialAtBeginning){
				showTutorial();
			}else{
				msgBus.publish('tutorialIsHide');
			}
		}else{
			gr.lib._tutorial.show(false);
            buttonInfo.show(true);
		}
	}

	function onDisableUI() {
		showHideInfoButton(false);
	}
	
	function onEnableUI() {
		showHideInfoButton(true);
	}
	function showTutorialOnInitial(){
		for (var i = minIndex; i <= maxIndex; i++) {
			if (i === minIndex) {
				gr.lib['_tutorialPage_0' + i].show(true);
				gr.lib['_tutorialPage_0' + i + '_Text_00'].show(true);
				gr.lib['_tutorialPageIcon_0' + i].setImage('tutorialPageIconOn');
			} else {
				gr.lib['_tutorialPage_0' + i].show(false);
				gr.lib['_tutorialPage_0' + i + '_Text_00'].show(false);
				gr.lib['_tutorialPageIcon_0' + i].setImage('tutorialPageIconOff');
			}
		}
		buttonInfo.show(false);
		gr.lib._BG_dim.show(true);
		gr.lib._tutorial.show(true);
		msgBus.publish('tutorialIsShown');
	}
	function onInitialize(){
		 if(showTutorialAtBeginning){
			showTutorialOnInitial();
		}else{
			msgBus.publish('tutorialIsHide');
		}
	}
	function onReStartUserInteraction(){
		if(showButtonInfoTimer){ 
			gr.getTimer().clearTimeout(showButtonInfoTimer);
			showButtonInfoTimer = null;
		}
		buttonInfo.show(true);
	}
	function onStartUserInteraction(){
		ButtonBetUpChannel = 0;
		ButtonBetDownChannel = 0;
		if(SKBeInstant.config.gameType === 'ticketReady'){
			if (showTutorialAtBeginning) {
				showTutorial();
			} else {
				msgBus.publish('tutorialIsHide');
			}
		}else{
			gr.lib._tutorial.show(false);
			buttonInfo.show(true);
		}
	}
    
    function onEnterResultScreenState() {
        showButtonInfoTimer = gr.getTimer().setTimeout(function () {
			gr.getTimer().clearTimeout(showButtonInfoTimer);
			showButtonInfoTimer = null;
            buttonInfo.show(true);
        }, Number(SKBeInstant.config.compulsionDelayInSeconds) * 1000);
	}
	function prepareAudio() {
        for (var i = 0; i < channelNum; i++) {
            audio.play('ButtonBetUp', 'ButtonBetUp' + i);
            audio.stopChannel('ButtonBetUp' + i);
            
            audio.play('ButtonBetDown', 'ButtonBetDown' + i);
            audio.stopChannel('ButtonBetDown' + i);
        }
    }
	function onPlayerWantsToMoveToMoneyGame(){
		if(showButtonInfoTimer){ 
			gr.getTimer().clearTimeout(showButtonInfoTimer);
			showButtonInfoTimer = null;
		}
        shouldShowTutorialWhenReinitial = true;
    }
	function onTutorialIsHide(){
		if(!showButtonInfoTimer){
            buttonInfo.show(true);
        }
	}
	msgBus.subscribe('enableUI', onEnableUI);
	msgBus.subscribe('disableUI', onDisableUI);
	msgBus.subscribe('jLotterySKB.reset', onEnableUI);
	msgBus.subscribe('jLottery.initialize', onInitialize);
	msgBus.subscribe('jLottery.reInitialize', onReInitialize);
	msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
	msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
	msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
    msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
	msgBus.subscribe('jLotteryGame.playerWantsToMoveToMoneyGame',onPlayerWantsToMoveToMoneyGame);
	msgBus.subscribe('tutorialIsHide', onTutorialIsHide);

	return {};
});