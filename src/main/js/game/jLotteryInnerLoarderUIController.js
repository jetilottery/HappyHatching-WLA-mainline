define([
        'skbJet/component/gameMsgBus/GameMsgBus',
        'skbJet/component/SKBeInstant/SKBeInstant',
		'skbJet/component/deviceCompatibility/windowSize',
		'skbJet/component/resourceLoader/resourceLib'
    ], function(msgBus, SKBeInstant, windowSize, resLib){
	
	var loadDiv = document.createElement('div');
	var gameImgDiv = document.createElement('div');
	var progressBarDiv = document.createElement('div');
	var progressDiv = document.createElement('div');
	var copyRightDiv = document.createElement('div');
	var orientation = 'landscape';
	var gce;

	var predefinedStyle = {
		landscape:{
			loadDiv:{
				width:'50%',
				height:'100%',
				margin:'auto'
			},
			gameImgDiv:{
				width: '90%',
				height: '80%',
				margin: 'auto',
				backgroundPosition:'center center',
				backgroundSize:'contain',
				backgroundRepeat:'no-repeat'
			},
			progressBarDiv:{
				width:'100%',
				height:'1.5%',
				minHeight:10,
				border:'solid 1px #000000',
				marginLeft:-1
			},
			progressDiv:{
				height:'100%',
				width:"0%",
				backgroundRepeat:'no-repeat',
				backgroundSize:'cover'
			},
			copyRightDiv:{
				width:'100%',
				textAlign:'center',
				bottom:20,
				fontSize:20,
				fontFamily: '"Roboto Condenced"',
				position:'absolute'
			}
		},
		portrait:{
			loadDiv:{
				width:'80%',
				height:'100%',
				margin:'auto'
			},
			gameImgDiv:{
				width:'90%',
				height:'80%',
				margin: 'auto',
				backgroundPosition:'center center',
				backgroundSize:'contain',
				backgroundRepeat:'no-repeat'
			},
			progressBarDiv:{
				width:'100%',
				height:'1.5%',
				minHeight:10,
				border:'solid 1px #000000',
				marginLeft:-1
			},
			progressDiv:{
				height:'100%',
				width:"0%",
				backgroundRepeat:'no-repeat',
				backgroundSize:'cover'
			},
			copyRightDiv:{
				width:'100%',
				textAlign:'center',
				bottom:20,
				fontSize:20,
				fontFamily: '"Roboto Condenced"',
				position:'absolute'
			}
		}
	};

	function applyStyle(elem, styleData){
		for(var s in styleData){
			if(typeof styleData[s] === 'number'){
				elem.style[s] = styleData[s]+'px';
			}else{
				elem.style[s] = styleData[s];
			}
		}
	}
	function setBgImageFromResLib(elem, imgName){
		if(resLib&&resLib.splash&&resLib.splash[imgName]){
			var bgImgUrl = resLib.splash[imgName].src;
			if(bgImgUrl){
				elem.style.backgroundImage = 'url('+bgImgUrl+')';
			}
		}
	}
	function onWindowResized(){
		var gameHeight = 0, gameWidth = 0;
		if(SKBeInstant.config.assetPack === 'desktop'){
			gameHeight = SKBeInstant.config.revealHeightToUse;
			gameWidth = SKBeInstant.config.revealWidthToUse;
		}else{
			var targetDiv = document.getElementById(SKBeInstant.config.targetDivId);
			gameWidth = targetDiv.clientWidth;
			gameHeight = targetDiv.clientHeight;
			var parentElem = targetDiv.parentElement;
			if(parentElem !== document.body){
				var parentWidth = parentElem.clientWidth;
				var parentHeight = parentElem.clientHeight;
				gameWidth = gameWidth > parentWidth ? parentWidth : gameWidth;
				gameHeight = gameHeight > parentHeight ? parentHeight : gameHeight;
			}
		}
		gce.style.width = gameWidth + 'px';
        gce.style.height = gameHeight + 'px';
		if(gameHeight>gameWidth){
			orientation = 'portrait';
		}else{
			orientation = 'landscape';
		}
		var pdd = predefinedStyle[orientation];
		applyStyle(loadDiv, pdd.loadDiv);
	}
	function onSplashLoadDone(){
		setBgImageFromResLib(gce, 'loadingBG');
		setBgImageFromResLib(gameImgDiv, 'loadingFront');
		setBgImageFromResLib(progressBarDiv, 'loadingBarBack');
		setBgImageFromResLib(progressDiv, 'loadingBarFront');
	}
	function initUI(){
		gce = SKBeInstant.getGameContainerElem();
		loadDiv.appendChild(gameImgDiv);
		loadDiv.appendChild(progressBarDiv);
		progressBarDiv.appendChild(progressDiv);
		loadDiv.appendChild(copyRightDiv);
		
		onWindowResized();
		var pdd = predefinedStyle[orientation];
		applyStyle(loadDiv, pdd.loadDiv);
		applyStyle(gameImgDiv, pdd.gameImgDiv);
		applyStyle(progressBarDiv, pdd.progressBarDiv);
		applyStyle(progressDiv, pdd.progressDiv);
		applyStyle(copyRightDiv, pdd.copyRightDiv);
		
		if(SKBeInstant.config.assetPack !== 'desktop'){
			window.addEventListener('resize', onWindowResized);
		}
		gce.style.backgroundSize = 'cover';
		gce.style.backgroundRepeat = 'no-repeat';
		gce.style.backgroundPosition = 'center';
		gce.style.position = "relative";
		gce.appendChild(loadDiv);
	}
	function clearDivFormatting(){
		var targetDiv = document.getElementById(SKBeInstant.config.targetDivId);
		targetDiv.innerHTML = "";
		targetDiv.style.background = '';
		targetDiv.style.backgroundSize = '';
		targetDiv.style.webkitUserSelect = '';
		targetDiv.style.webkitTapHighlightColor = '';
	}

    function onStartAssetLoading(){
		if(SKBeInstant.isSKB()){
			return;
		}
		clearDivFormatting();
		initUI();
	}
	
	function updateLoadingProgress(data){
		if(SKBeInstant.isSKB()){
			return;
		}
		progressDiv.style.width = (data.current / data.items) * 100 + "%";
	}
	function onAssetsLoadedAndGameReady(){
		if(SKBeInstant.config.assetPack !== 'desktop'){
			window.removeEventListener('resize', onWindowResized);
		}
	}
	msgBus.subscribe('jLottery.startAssetLoading', onStartAssetLoading);
	msgBus.subscribe('jLotteryGame.updateLoadingProgress', updateLoadingProgress);
	msgBus.subscribe('jLotteryGame.assetsLoadedAndGameReady', onAssetsLoadedAndGameReady);
	msgBus.subscribe('loadController.jLotteryEnvSplashLoadDone', onSplashLoadDone);
    return {};
});