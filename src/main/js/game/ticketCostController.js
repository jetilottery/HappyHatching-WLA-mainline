/**
 * @module game/ticketCost
 * @description ticket cost meter control
 */
define([
	'skbJet/component/gladPixiRenderer/Sprite',
	'skbJet/component/gameMsgBus/GameMsgBus',
	'skbJet/component/audioPlayer/AudioPlayerProxy',
	'skbJet/component/gladPixiRenderer/gladPixiRenderer',
	'skbJet/component/pixiResourceLoader/pixiResourceLoader',
	'skbJet/component/SKBeInstant/SKBeInstant',
	'skbJet/componentCRDC/gladRenderer/gladButton',
	'../game/gameUtils'
], function (Sprite, msgBus, audio, gr, loader, SKBeInstant, gladButton, gameUtils) {
	
	var plusButton, minusButton;
	var _currentPrizePoint, prizePointList;
	var ticketIcon, ticketIconObj = null;
	var hasTicket = false, tutorialVisible;
	var channelNum = 3;
    var ButtonBetUpChannel = 0;
    var ButtonBetDownChannel = 0;
	var MTMReinitial = false;
	
	function registerControl() {
		var formattedPrizeList = [];
		var strPrizeList = [];
		for (var i = 0; i < prizePointList.length; i++) {
			formattedPrizeList.push(SKBeInstant.formatCurrency(prizePointList[i]).formattedAmount);
			strPrizeList.push(prizePointList[i] + '');
		}
		var priceText, stakeText;
		if(SKBeInstant.isWLA()){
			priceText = loader.i18n.MenuCommand.WLA.price;
			stakeText = loader.i18n.MenuCommand.WLA.stake;
		}else{
			priceText = loader.i18n.MenuCommand.Commercial.price;
			stakeText = loader.i18n.MenuCommand.Commercial.stake;            
		}
		msgBus.publish("jLotteryGame.registerControl", [{
			name: 'price',
			text: priceText,
			type: 'list',
			enabled: 1,
			valueText: formattedPrizeList,
			values: strPrizeList,
			value: SKBeInstant.config.gameConfigurationDetails.pricePointGameDefault
		}]);
		msgBus.publish("jLotteryGame.registerControl", [{
			name: 'stake',
			text: stakeText,
			type: 'stake',
			enabled: 0,
			valueText: '0',
			value: 0
		}]);
	}
	
	function gameControlChanged(value) {
		msgBus.publish("jLotteryGame.onGameControlChanged",{
			name: 'stake',
			event: 'change',
			params: [(SKBeInstant.formatCurrency(value).amount)/100, SKBeInstant.formatCurrency(value).formattedAmount]
		});
		msgBus.publish("jLotteryGame.onGameControlChanged",{
			name: 'price',
			event: 'change',
			params: [value, SKBeInstant.formatCurrency(value).formattedAmount]
		});
	}
	
	function onConsoleControlChanged(data){
		if (data.option === 'price') {
			setTicketCostValue(Number(data.value));
			msgBus.publish("jLotteryGame.onGameControlChanged", {
				name: 'stake',
				event: 'change',
				params: [(SKBeInstant.formatCurrency(data.value).amount)/100, SKBeInstant.formatCurrency(data.value).formattedAmount]
			});
		}
	}

	function onGameParametersUpdated() {
		prepareAudio();
		gameUtils.setTextStyle(gr.lib._ticketCostText,{padding:10, stroke:"#350707", strokeThickness:4, fill:"#ffffff"});
		gr.lib._ticketCostText.autoFontFitText = true;
		gr.lib._ticketCostText.setText(loader.i18n.Game.wager);
		gameUtils.setTextStyle(gr.lib._ticketCostValue,{padding:10, stroke:"#350707", strokeThickness:4, fill:"#ffffff"});
		gameUtils.setTextStyle(gr.lib._ticketCostValueMTM,{padding:10, stroke:"#350707", strokeThickness:4, fill:"#ffffff"});
		
		prizePointList = [];
		ticketIcon = {};

		var style = {
            "_id": "_dfgbka",
            "_name": "_ticketCostLevelIcon_",
            "_SPRITES": [],
            "_style": {
                "_width": "20",
                "_height": "5",
                "_left": "196",
                "_background": {
                    "_imagePlate": "_ticketCostLevelIconOff"
                },
                "_top": "86",
                "_transform": {
                    "_scale": {
                        "_x": "0.9",
                        "_y": "0.9"
                    }
                }
            }
        };

        var length = SKBeInstant.config.gameConfigurationDetails.revealConfigurations.length;
        var width = Number(style._style._width) * Number(style._style._transform._scale._x);
        var space = 4;
		var gameSize = gr.getSize();
		var gameWidth = gameSize.width;
        var left = (gameWidth - (length * width + (length - 1) * space)) / 2 - gr.lib._ticketCost._currentStyle._left;
        for (var i = 0; i < length; i++) {
            var spData = JSON.parse(JSON.stringify(style));
            spData._id = style._id + i;
            spData._name = spData._name + i;
            spData._style._left = left + (width + space) * i;
            var sprite = new Sprite(spData);
            gr.lib._ticketCost.pixiContainer.addChild(sprite.pixiContainer);

            var price = SKBeInstant.config.gameConfigurationDetails.revealConfigurations[i].price;
            prizePointList.push(price);
            ticketIcon[price] = "_ticketCostLevelIcon_" + i;
		}
        var scaleType = {'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92,'avoidMultiTouch':true};
        plusButton = new gladButton(gr.lib._ticketCostPlus, "ticketCostPlus", {'scaleXWhenClick': -0.92, 'scaleYWhenClick': 0.92,'avoidMultiTouch':true});
        minusButton = new gladButton(gr.lib._ticketCostMinus, "ticketCostMinus", scaleType);        
        registerControl();
        
        if(prizePointList.length <= 1){
			for (var key in ticketIcon){
                gr.lib[ticketIcon[key]].show(false);
            }
            plusButton.show(false);
            minusButton.show(false);
        }else{
            plusButton.show(true);
			minusButton.show(true);
            plusButton.click(increaseTicketCost);
            minusButton.click(decreaseTicketCost);
        }
		setDefaultPricePoint();
        gameUtils.fixMeter(gr);
	}

	function setTicketCostValue(prizePoint) {
		var index = prizePointList.indexOf(prizePoint);
		if (index < 0) {
			msgBus.publish('error', 'Invalide prize point ' + prizePoint);
			return;
		}
		if (index === 0) {
			minusButton.enable(false);
		} else {
			minusButton.enable(true);
		}
		if (index === (prizePointList.length - 1)) {
			plusButton.enable(false);
		} else {
			plusButton.enable(true);
		}
		var valueString = SKBeInstant.formatCurrency(prizePoint).formattedAmount;
		if(SKBeInstant.config.wagerType === 'BUY'){
			gr.lib._ticketCostValue.autoFontFitText = true;
			gr.lib._ticketCostValue.setText(valueString);
			gr.lib._ticketCostValueMTM.show(false);
			gr.lib._ticketCostValue.show(true);
		}else{
			gr.lib._ticketCostValue.show(false);
			gr.lib._ticketCostValueMTM.show(true);
			gr.lib._ticketCostValueMTM.autoFontFitText = true;
			gr.lib._ticketCostValueMTM.setText(loader.i18n.Game.demo + ' ' + valueString);
		}        
	  
		if (ticketIconObj) {
			ticketIconObj.setImage('ticketCostLevelIconOff');
		}
		ticketIconObj = gr.lib[ticketIcon[prizePoint]];
		ticketIconObj.setImage('ticketCostLevelIconOn');
		
		_currentPrizePoint = prizePoint;
		msgBus.publish('ticketCostChanged', prizePoint);
	}
	
	function setTicketCostValueWithNotify(prizePoint){
		setTicketCostValue(prizePoint);
		gameControlChanged(prizePoint);
	}

	function increaseTicketCost() {
		var index = prizePointList.indexOf(_currentPrizePoint);
		index++;
		setTicketCostValueWithNotify(prizePointList[index]);
		if(index === prizePointList.length - 1){
			audio.play('ButtonBetMax','ButtonBetMax');
		}else{
			audio.play('ButtonBetUp','ButtonBetUp' + (ButtonBetUpChannel % channelNum));
			ButtonBetUpChannel++;
		}
	}

	function decreaseTicketCost() {
		var index = prizePointList.indexOf(_currentPrizePoint);
		index--;
		setTicketCostValueWithNotify(prizePointList[index]);
		audio.play('ButtonBetDown','ButtonBetDown' + (ButtonBetDownChannel % channelNum));
		ButtonBetDownChannel++;
	}

	function setDefaultPricePoint() {
		setTicketCostValueWithNotify(SKBeInstant.config.gameConfigurationDetails.pricePointGameDefault);
	}

	function onInitialize() {
		setDefaultPricePoint();
		if(tutorialVisible){
			gr.lib._ticketCost.show(false);
		}else{
			gr.lib._ticketCost.show(true);
		}
	}

	function onReInitialize() {
		if(MTMReinitial){
			enableConsole();
			setDefaultPricePoint();
			hasTicket = false;
			if(!tutorialVisible){
				gr.lib._ticketCost.show(true);
			}
			MTMReinitial = false;
		}else{
			onReset();
		}
	}
	function onReset(){
		enableConsole();
		if(_currentPrizePoint){
			setTicketCostValueWithNotify(_currentPrizePoint);
		}else{
			setDefaultPricePoint();
		}
		hasTicket = false;
		gr.lib._ticketCost.show(true);
	}
	function onStartUserInteraction(data) {
        ButtonBetUpChannel = 0;
        ButtonBetDownChannel = 0;
		disableConsole();
		hasTicket = true;
		gr.lib._ticketCost.show(false);
		if (data.price) {
			_currentPrizePoint = data.price;
			setTicketCostValueWithNotify(_currentPrizePoint);
		}
		msgBus.publish('ticketCostChanged', _currentPrizePoint);
	}

	function onReStartUserInteraction(data) {
		onStartUserInteraction(data);
	}
	function enableConsole(){
		msgBus.publish('toPlatform',{
			channel:"Game",
			topic:"Game.Control",
			data:{"name":"price","event":"enable","params":[1]}
		});
	} 
	function disableConsole(){
		msgBus.publish('toPlatform',{
			channel:"Game",
			topic:"Game.Control",
			data:{"name":"price","event":"enable","params":[0]}
		});
	}
	
	function disableTicketCostButton(){
		minusButton.enable(false);
		plusButton.enable(false);
	}
	
	function onPlayerWantsPlayAgain(){
		hasTicket = false;
		enableConsole();
		setTicketCostValueWithNotify(_currentPrizePoint);
		gr.lib._ticketCost.show(true);
	}
	function onTutorialIsHide(){
		tutorialVisible = false;
		if(hasTicket){
			gr.lib._ticketCost.show(false);
		}else{
			gr.lib._ticketCost.show(true);
		}
	}
	function onTutorialIsShown(){
		tutorialVisible = true;
		gr.lib._ticketCost.show(false);
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
        MTMReinitial = true;
    }
	msgBus.subscribe("playerWantsPlayAgain", onPlayerWantsPlayAgain);
	msgBus.subscribe('jLotterySKB.reset', onReset);
	msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
	msgBus.subscribe('jLottery.initialize', onInitialize);
	msgBus.subscribe('jLottery.reInitialize', onReInitialize);
	msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
	msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
	msgBus.subscribe('jLotterySKB.onConsoleControlChanged', onConsoleControlChanged);
	msgBus.subscribe('tutorialIsShown', onTutorialIsShown);
	msgBus.subscribe('tutorialIsHide', onTutorialIsHide);
	msgBus.subscribe('jLotteryGame.playerWantsToMoveToMoneyGame',onPlayerWantsToMoveToMoneyGame);
	msgBus.subscribe('disableTicketCost', disableTicketCostButton);

	return {};
});