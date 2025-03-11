define([
	'skbJet/component/resourceLoader/resourceLib',
	'skbJet/componentCRDC/splash/splashLoadController',
	'skbJet/componentCRDC/splash/splashUIController'
], function(resLib, splashLoadController, splashUIController){
	
	var progressBarDiv, progressDiv, gameImgDiv;
	var gameImgDivWidth, progressBarDivWidth;
	var softId = window.location.search.match(/&?softwareid=(\d+.\d+.\d+)?/);
	var showCopyRight = false;
	if(softId){
		if(softId[1].split('-')[2].charAt(0) !== '0'){
			showCopyRight = true;
		}
	}  

	function checkScreenMode() {
		var winW = Math.floor(Number(window.innerWidth));
		var winH = Math.floor(Number(window.innerHeight));
		return winW >= winH ? "landScape" : "portrait";
	}

	function updateLayoutRelatedByScreenMode() {
		if (checkScreenMode() === 'landScape') {
			gameImgDivWidth = '50%';
			progressBarDivWidth = '45%';
		} else {
			gameImgDivWidth = '80%';
			progressBarDivWidth = '60%';
		}
	}

	function onLoadDone() {
		document.body.style.backgroundImage = 'url(' + resLib.splash.loadingBG.src + ')';
		updateLayoutRelatedByScreenMode();
		gameImgDiv = document.getElementById("gameImgDiv");
		progressBarDiv = document.getElementById("progressBarDiv");
		progressDiv = document.getElementById("progressDiv");
		if(showCopyRight){
			var copyRightDiv = document.getElementById('copyRightDiv');
			copyRightDiv.innerHTML = resLib.i18n.splash.splashScreen.footer.shortVersion;
			copyRightDiv.style.color = '#000000';
		}
		gameImgDiv.style.display = 'none';
		progressBarDiv.style.display = 'none';
		progressDiv.style.display = 'none';
		
		onWindowResized();
		
		gameImgDiv.style.position = 'relative';
		gameImgDiv.style.margin = 'auto';
		gameImgDiv.style.backgroundImage = 'url(' + resLib.splash.loadingFront.src + ')';
		gameImgDiv.style.backgroundSize = 'contain';
		gameImgDiv.style.backgroundPosition = 'center center';
		
		progressBarDiv.style.position = 'relative';
		progressBarDiv.style.backgroundImage = 'url(' + resLib.splash.loadingBarBack.src + ')';
		progressBarDiv.style.minHeight = '10px';
		progressBarDiv.style.margin = 'auto';
		progressBarDiv.style.backgroundRepeat = 'no-repeat';
		progressBarDiv.style.backgroundSize = 'cover';
		progressBarDiv.style.border = 'solid 1px #000000';

		progressDiv.style.position = 'relative';
		progressDiv.style.backgroundImage = 'url(' + resLib.splash.loadingBarFront.src + ')';
		progressDiv.style.backgroundSize = 'cover';
		progressDiv.style.backgroundRepeat = 'no-repeat';
		progressDiv.style.height = '100%';
		
		gameImgDiv.style.display = 'block';
		progressBarDiv.style.display = 'block';
		progressDiv.style.display = 'block';

		splashUIController.onSplashLoadDone();

		window.addEventListener('resize', onWindowResized);
		window.postMessage('splashLoaded', window.location.origin);
	}

	function onWindowResized() {
		updateLayoutRelatedByScreenMode();
		gameImgDiv.style.width = gameImgDivWidth;
		gameImgDiv.style.height = '80%';
		progressBarDiv.style.width = progressBarDivWidth;
		progressBarDiv.style.height = '1.5%';
		progressBarDiv.style.left = '0';
		progressBarDiv.style.top = '0';
	}
	
	function init(){
		splashUIController.init({layoutType: 'IW'});
		splashLoadController.load(onLoadDone);
	}
	init();
	return {};
});