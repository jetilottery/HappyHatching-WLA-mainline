define(function(){
	
	function setTextStyle(Sprite, style){
		for(var key in style){
			Sprite.pixiContainer.$text.style[key] = style[key];
		}
	}
	function setTextVerticalMiddle(Sprite){
		Sprite.pixiContainer.$text.y = (Sprite._currentStyle._height - Sprite.pixiContainer.$text.height)/2;
	}
	function setText(Sprite, text){
		Sprite.pixiContainer.$text.text = text;
	}
	function fixMeter(gr) {
		var balanceText = gr.lib._balanceText;
		var balanceValue = gr.lib._balanceValue;
		balanceValue.pixiContainer.$text.style.wordWrap = false;
		var meterDivision0 = gr.lib._meterDivision0;
		var ticketCostMeterText = gr.lib._ticketCostMeterText;
		var ticketCostMeterValue = gr.lib._ticketCostMeterValue;
		ticketCostMeterValue.pixiContainer.$text.style.wordWrap = false;
		var meterDivision1 = gr.lib._meterDivision1;
		var winsText = gr.lib._winsText;
		var winsValue = gr.lib._winsValue;
		var metersBG = gr.lib._metersBG;

		var len = metersBG._currentStyle._width;
		var temp, balanceLeft;
		var top4OneLine = metersBG._currentStyle._top + (metersBG._currentStyle._height - balanceText._currentStyle._text._lineHeight)/2;
		var top4TwoLine0 = metersBG._currentStyle._top + (metersBG._currentStyle._height - balanceText._currentStyle._text._lineHeight*2)/2;
		var top4TwoLine1 = top4TwoLine0 + balanceText._currentStyle._text._lineHeight;
		if (balanceText.pixiContainer.visible) {
			temp = (len - (ticketCostMeterText.pixiContainer.$text.width + ticketCostMeterValue.pixiContainer.$text.width + meterDivision0.pixiContainer.$text.width + balanceText.pixiContainer.$text.width + balanceValue.pixiContainer.$text.width + meterDivision1.pixiContainer.$text.width + winsText.pixiContainer.$text.width + winsValue.pixiContainer.$text.width)) / 2;
			balanceLeft = (len - (ticketCostMeterText.pixiContainer.$text.width + ticketCostMeterValue.pixiContainer.$text.width)) / 2;
			balanceLeft = balanceLeft - meterDivision0.pixiContainer.$text.width - balanceValue.pixiContainer.$text.width - balanceText.pixiContainer.$text.width;
			if(temp >= 6){
				meterDivision1.show(true);
				if(balanceLeft >= 6){ //ticket cost in center
					ticketCostMeterText.updateCurrentStyle({'_left': (len - (ticketCostMeterText.pixiContainer.$text.width + ticketCostMeterValue.pixiContainer.$text.width)) / 2, '_top':top4OneLine});
					ticketCostMeterValue.updateCurrentStyle({'_left': (ticketCostMeterText._currentStyle._left + ticketCostMeterText.pixiContainer.$text.width), '_top':top4OneLine});
					ticketCostMeterValue.pixiContainer.$text.style.wordWrap = false;
					meterDivision0.updateCurrentStyle({'_left': (ticketCostMeterText._currentStyle._left - meterDivision0.pixiContainer.$text.width), '_top':(top4OneLine-8)});
					balanceValue.updateCurrentStyle({'_left': (meterDivision0._currentStyle._left - balanceValue.pixiContainer.$text.width), '_top':top4OneLine});
					balanceValue.pixiContainer.$text.style.wordWrap = false;
					balanceText.updateCurrentStyle({'_left': (balanceValue._currentStyle._left - balanceText.pixiContainer.$text.width), '_top':top4OneLine});
					meterDivision1.updateCurrentStyle({'_left': (ticketCostMeterValue._currentStyle._left + ticketCostMeterValue.pixiContainer.$text.width), '_top':(top4OneLine-8)});
					winsText.updateCurrentStyle({'_left': (meterDivision1._currentStyle._left + meterDivision1.pixiContainer.$text.width), '_top':top4OneLine});
					winsValue.updateCurrentStyle({'_left': (winsText._currentStyle._left + winsText.pixiContainer.$text.width), '_top':top4OneLine});
				}else{ //content in center
					balanceText.updateCurrentStyle({'_left': temp, '_top':top4OneLine});
					balanceValue.updateCurrentStyle({'_left': (balanceText._currentStyle._left + balanceText.pixiContainer.$text.width), '_top':top4OneLine});
					balanceValue.pixiContainer.$text.style.wordWrap = false;
					meterDivision0.updateCurrentStyle({'_left': (balanceValue._currentStyle._left + balanceValue.pixiContainer.$text.width), '_top':(top4OneLine-8)});
					ticketCostMeterText.updateCurrentStyle({'_left': (meterDivision0._currentStyle._left + meterDivision0.pixiContainer.$text.width), '_top':top4OneLine});
					ticketCostMeterValue.updateCurrentStyle({'_left': (ticketCostMeterText._currentStyle._left + ticketCostMeterText.pixiContainer.$text.width), '_top':top4OneLine});
					ticketCostMeterValue.pixiContainer.$text.style.wordWrap = false;
					meterDivision1.updateCurrentStyle({'_left': (ticketCostMeterValue._currentStyle._left + ticketCostMeterValue.pixiContainer.$text.width), '_top':(top4OneLine-8)});
					winsText.updateCurrentStyle({'_left': (meterDivision1._currentStyle._left + meterDivision1.pixiContainer.$text.width), '_top':top4OneLine});
					winsValue.updateCurrentStyle({'_left': (winsText._currentStyle._left + winsText.pixiContainer.$text.width), '_top':top4OneLine});
				}
			}else{//content is too long, use two lines to show the content.
				var left0 = (len - (ticketCostMeterText.pixiContainer.$text.width + ticketCostMeterValue.pixiContainer.$text.width + meterDivision0.pixiContainer.$text.width + balanceText.pixiContainer.$text.width + balanceValue.pixiContainer.$text.width)) / 2;
				balanceText.updateCurrentStyle({'_left': left0, '_top':top4TwoLine0});
				balanceValue.updateCurrentStyle({'_left': (balanceText._currentStyle._left + balanceText.pixiContainer.$text.width), '_top':top4TwoLine0});
				balanceValue.pixiContainer.$text.style.wordWrap = false;
				meterDivision0.updateCurrentStyle({'_left': (balanceValue._currentStyle._left + balanceValue.pixiContainer.$text.width), '_top':(top4TwoLine0-8)});
				ticketCostMeterText.updateCurrentStyle({'_left': (meterDivision0._currentStyle._left + meterDivision0.pixiContainer.$text.width), '_top':top4TwoLine0});
				ticketCostMeterValue.updateCurrentStyle({'_left': (ticketCostMeterText._currentStyle._left + ticketCostMeterText.pixiContainer.$text.width), '_top':top4TwoLine0});
				ticketCostMeterValue.pixiContainer.$text.style.wordWrap = false;
				var left1= (len - (winsText.pixiContainer.$text.width + winsValue.pixiContainer.$text.width))/2;
				meterDivision1.show(false);
				winsText.updateCurrentStyle({'_left': left1, '_top':top4TwoLine1});
				winsValue.updateCurrentStyle({'_left': (winsText._currentStyle._left + winsText.pixiContainer.$text.width), '_top':top4TwoLine1});    
			}
		} else {//balanceDisplayInGame is false
			meterDivision1.show(true);
			ticketCostMeterText.updateCurrentStyle({'_left': (len - (ticketCostMeterText.pixiContainer.$text.width + ticketCostMeterValue.pixiContainer.$text.width + meterDivision1.pixiContainer.$text.width + winsText.pixiContainer.$text.width + winsValue.pixiContainer.$text.width)) / 2, '_top':top4OneLine});
			ticketCostMeterValue.updateCurrentStyle({'_left': (ticketCostMeterText._currentStyle._left + ticketCostMeterText.pixiContainer.$text.width), '_top':top4OneLine});
			ticketCostMeterValue.pixiContainer.$text.style.wordWrap = false;
			meterDivision1.updateCurrentStyle({'_left': (ticketCostMeterValue._currentStyle._left + ticketCostMeterValue.pixiContainer.$text.width), '_top':(top4OneLine-8)});
			winsText.updateCurrentStyle({'_left': (meterDivision1._currentStyle._left + meterDivision1.pixiContainer.$text.width), '_top':top4OneLine});
			winsValue.updateCurrentStyle({'_left': (winsText._currentStyle._left + winsText.pixiContainer.$text.width), '_top':top4OneLine});
		}
	}
	/*
	 * hotSpot {Object}
	 */
	function judgeHotSpot(hotSpot, tarPoint){
		//linear function : y = kx + b
		/*function linearCalX(sp,ep,y){
			return (y * (ep.x - sp.x) + sp.x * ep.y - ep.x * sp.y)/(ep.y - sp.y);
		}*/
		function linearCalY(sp,ep,x){
			return (x * (ep.y - sp.y) - sp.x * ep.y + ep.x * sp.y)/(ep.x - sp.x);
		}
		function getAdjacentCouplePoints(tarPoint){
			var couplePointsX = [];
			var curIdx, nextIdx;
			for(var i = 0; i < hotSpot.length; i++){
				curIdx = i;
				nextIdx = (i + 1)%hotSpot.length;
				if(hotSpot[curIdx].x >= tarPoint.x && tarPoint.x >= hotSpot[nextIdx].x){
					couplePointsX.push({sp: hotSpot[nextIdx],ep: hotSpot[curIdx]});
				}else if(hotSpot[curIdx].x <= tarPoint.x && tarPoint.x <= hotSpot[nextIdx].x){
					couplePointsX.push({sp: hotSpot[curIdx],ep: hotSpot[nextIdx]});
				}
			}
			return couplePointsX;
		}
		var cpPoints = getAdjacentCouplePoints(tarPoint);
		var intersectionsAbove = [];
		var intersectionsBelow = [];
		var intersection;
		for(var i = 0; i < cpPoints.length; i++){
			intersection = linearCalY(cpPoints[i].sp, cpPoints[i].ep, tarPoint.x);
			if(intersection < tarPoint.y){
				intersectionsAbove.push(intersection);
			}else if(intersection > tarPoint.y){
				intersectionsBelow.push(intersection);
			}
		}
		if(intersectionsAbove.length % 2 === 0 || intersectionsBelow.length % 2 === 0){
			return false;
		}else{
			return true;
		}
	}
	function fixTicketSelect(gr , prizePointList , normalNumber) {
		var ticketSelect = gr.lib._ticketCostLevelIcon_0.parent;
		var gameWidth = gr.getPixiRenderer().view.width;
		var ticketSelectWidth = ticketSelect._currentStyle._width;
		var ticketSelectLeft = ticketSelect._currentStyle._left || 0;
		if(gameWidth !== ticketSelectWidth || ticketSelectLeft !== 0){
			ticketSelectWidth = gameWidth - ticketSelectLeft * 2;
		}
		var iconNumber = prizePointList.length;
		var originLeft = gr.lib._ticketCostLevelIcon_0._currentStyle._left;
		if(iconNumber === normalNumber){
			return;
		}else{
			var scale = gr.lib._ticketCostLevelIcon_0._currentStyle._transform._scale._x;
			var lastTicketIcon = gr.lib["_ticketCostLevelIcon_" + (iconNumber - 1)];
			var iconWidth = lastTicketIcon._currentStyle._width * scale;
			var len = lastTicketIcon._currentStyle._left + iconWidth - gr.lib._ticketCostLevelIcon_0._currentStyle._left;
			var currentLeft = (ticketSelectWidth - len)/2;
			var diffValue = currentLeft - originLeft - iconWidth;
			for(var i = 0; i < iconNumber;i++){ 
				gr.lib["_ticketCostLevelIcon_" + i].updateCurrentStyle({"_left":gr.lib["_ticketCostLevelIcon_" + i]._currentStyle._left + diffValue});
			}
		}
	}
	function fontFitForVerticalOverflow(sprObj){
		var sprHeight = sprObj._currentStyle._height;
		var sprTxtHeight = sprObj.pixiContainer.$text.height;
		var fontSize = sprObj._currentStyle._font._size;
		if(sprTxtHeight > sprHeight){
			fontSize--;
			sprObj.updateCurrentStyle({'_font':{'_size':fontSize}});
			fontFitForVerticalOverflow(sprObj);
		}
	}
	function setTextAlignCenter(spr){
		if(spr.pixiContainer.$text){
			var scale = 1;
			var ctnHeight = spr._currentStyle._height;
			var txtHeight = spr.pixiContainer.$text.height;
			var ctnWidth = spr._currentStyle._width;
			var txtWidth = spr.pixiContainer.$text.width;
			if(txtHeight > ctnHeight || txtWidth > ctnWidth){
				var ratioH = ctnHeight/txtHeight;
				var ratioW = ctnWidth/txtWidth;
				scale = ratioH > ratioW ? ratioW : ratioH;
			}
			spr.pixiContainer.scale.set(scale);
			spr.pixiContainer.$text.y = (ctnHeight - txtHeight)/2;
			spr.pixiContainer.$text.x = (ctnWidth - txtWidth)/2;
		}
	}
	return{
		setTextStyle:setTextStyle,
		setTextVerticalMiddle:setTextVerticalMiddle,
		setText:setText,
		fixMeter: fixMeter,
		judgeHotSpot: judgeHotSpot,
		fixTicketSelect: fixTicketSelect,
		fontFitForVerticalOverflow: fontFitForVerticalOverflow,
		setTextAlignCenter: setTextAlignCenter
	};
});

