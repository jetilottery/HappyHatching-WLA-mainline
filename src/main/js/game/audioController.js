/**
 * @module audioController
 * @memberof game
 * @description
 * @author Alex Wang
 */
define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/audioPlayer/AudioPlayerProxy',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/SKBeInstant/SKBeInstant',
    'skbJet/componentCRDC/gladRenderer/gladButton'
], function (msgBus, audio, gr, SKBeInstant, gladButton) {
    var audioDisabled = true;
    var audioOn, audioOff;
    var shouldShowTutorialWhenReinitial = false;
    var popUpDialog = false;

    function audioSwitch() {
		if(audioDisabled){
			audioOn.show(true);
			audioOff.show(false);
			audioDisabled = false;
		}else{
			audioOn.show(false);
			audioOff.show(true);
			audioDisabled = true;
		}
		audio.muteAll(audioDisabled);
		audio.gameAudioControlChanged(audioDisabled);
	}
    function onConsoleControlChanged(data) {
		if(data.option === 'sound'){
			if (audio.consoleAudioControlChanged(data)) {
				audioOn.show(false);
				audioOff.show(true);
				audioDisabled = true;
			} else {
				audioOn.show(true);
				audioOff.show(false);
				audioDisabled = false;
			}
			audio.muteAll(audioDisabled);
		}
    }

    function onStartUserInteraction() {
		if(SKBeInstant.config.gameType === 'ticketReady' && SKBeInstant.config.assetPack !== 'desktop'){
			return;
		}else{
			audio.play('BaseMusicLoop', 'base', true);
		}
    }

    function onEnterResultScreenState() {
        audio.play('BaseMusicLoopTerm', 'base');
    }

    function onReStartUserInteraction() {
        audio.play('BaseMusicLoop', 'base', true);
    }
    function onInitialize(){
        if(SKBeInstant.config.assetPack === 'desktop'){
            audio.play('GameInit', 'base');
        }else{
			return;
		}
    }
    function reset() {
        audio.stopAllChannel();
    }
    
    function onReInitialize(){
        audio.stopAllChannel();
		if(shouldShowTutorialWhenReinitial){
			shouldShowTutorialWhenReinitial = false;
			audio.play('GameInit', 'base');
		}
    }
	
    function onGameParametersUpdated() {
        var scaleType = {'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92};
        audioDisabled = SKBeInstant.config.soundStartDisabled;
		if(SKBeInstant.config.assetPack !== 'desktop'&& popUpDialog){
			audioDisabled = true;
		}
        audioOn = new gladButton(gr.lib._buttonAudioOn, "buttonAudioOn", scaleType);
        audioOff = new gladButton(gr.lib._buttonAudioOff, "buttonAudioOff", scaleType);
		
        if (audioDisabled) {
            gr.lib._buttonAudioOn.show(false);
            gr.lib._buttonAudioOff.show(true);
        } else {
            gr.lib._buttonAudioOn.show(true);
            gr.lib._buttonAudioOff.show(false);
        }
        audio.muteAll(audioDisabled);
		
        audioOn.click(audioSwitch);
        audioOff.click(audioSwitch);
    }
	function onPlayerSelectedAudioWhenGameLaunch(data){
        if(popUpDialog){
            audioDisabled = data;
            audioSwitch();
        }else{
            audio.muteAll(audioDisabled);
        }
        // if (SKBeInstant.config.assetPack === 'desktop') { //SKB desktop
        //     audio.muteAll(audioDisabled); //Audio component enable audio default value is true when desktop, with IW, game should use parameter instead of the default value.
        //     audio.gameAudioControlChanged(audioDisabled);
        //     return;
        // }else{//mobile or tablet, no matter SKB or not.
        //     audioDisabled = data;
		// 	audioSwitch();
        // }

        if (SKBeInstant.config.gameType === 'ticketReady') {
			audio.play('BaseMusicLoop', 'base', true);            
        }else{
            audio.play('GameInit', 'base');
        }
	}
	function onPlayerWantsToMoveToMoneyGame(){
        shouldShowTutorialWhenReinitial = true;
    }
    msgBus.subscribe('jLottery.reInitialize', onReInitialize);
    msgBus.subscribe('jLottery.initialize', onInitialize);
    msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
    msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
    msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
    msgBus.subscribe('jLotterySKB.onConsoleControlChanged', onConsoleControlChanged);
    msgBus.subscribe('jLotterySKB.reset', reset);
	msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
	msgBus.subscribe('audioPlayer.playerSelectedWhenGameLaunch',onPlayerSelectedAudioWhenGameLaunch);
	msgBus.subscribe('jLotteryGame.playerWantsToMoveToMoneyGame',onPlayerWantsToMoveToMoneyGame);
	/*Since there is an issue that the audio dialog cannot display due to a wrong configuration in KY env has been deferred, we have to change game to no audio dialog mode to active audio for IOS.
	msgBus.subscribe('resourceLoaded', function(){
		audio.enableAudioDialog(true);
	});*/
    return {};
});