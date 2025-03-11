/**
 * @module game/winUpToController
 * @description WinUpTo control
 */
define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/pixiResourceLoader/pixiResourceLoader',
    'skbJet/component/SKBeInstant/SKBeInstant',
    '../game/gameUtils'
], function(msgBus, gr, loader, SKBeInstant, gameUtils) {
    var orientation;
    /*var winUpToWidth;
    var winUpToPadding = 20;
    var sprScale = 1;*/
    var winUpToStyle = { padding: 10, stroke: "#3d1f05", strokeThickness: 4, fill: ["#ffe83f", "#ffbd27", "#ffe83f"], wordWrap: false };

    function onGameParametersUpdated() {
        if (!orientation) {
            orientation = SKBeInstant.getGameOrientation();
        }
        if (orientation === 'portrait') {
            gr.lib._winUpToText.autoFontFitText = true;
            gr.lib._winUpToText.setText(loader.i18n.Game.win_up_to);
            gameUtils.setTextStyle(gr.lib._winUpToText, winUpToStyle);
        }
    }

    function onTicketCostChanged(prizePoint) {
        var rc = SKBeInstant.config.gameConfigurationDetails.revealConfigurations;
        if (!orientation) {
            orientation = SKBeInstant.getGameOrientation();
        }
        for (var i = 0; i < rc.length; i++) {
            if (Number(prizePoint) === Number(rc[i].price)) {
                var ps = rc[i].prizeStructure;
                var maxPrize = 0;
                for (var j = 0; j < ps.length; j++) {
                    var prize = Number(ps[j].prize);
                    if (maxPrize < prize) {
                        maxPrize = prize;
                    }
                }
                if (orientation === 'portrait') {
                    gr.lib._winUpToValue.autoFontFitText = true;
                    gr.lib._winUpToValue.setText(SKBeInstant.formatCurrency(maxPrize).formattedAmount + '!');
                    gameUtils.setTextStyle(gr.lib._winUpToValue, winUpToStyle);
                } else {
                    gr.lib._winUpTo.autoFontFitText = true;
                    gr.lib._winUpTo.setText(loader.i18n.Game.win_up_to + ' ' + SKBeInstant.formatCurrency(maxPrize).formattedAmount + '!');
                    gameUtils.setTextStyle(gr.lib._winUpTo, winUpToStyle);
                }
                return;
            }
        }
    }
    /*function adjustScaleAndPosition(spriteArr){
        if(spriteArr.some(function(elem){
            return elem.pixiContainer.$text.text.trim().length === 0;
        })){
            return;
        }
        if(!orientation){
            orientation = SKBeInstant.getGameOrientation();
        }
        if(!winUpToWidth){
            winUpToWidth = gr.lib._winUpTo._currentStyle._width;
        }
        if(orientation === 'landscape'){
            var textTotalWidth = spriteArr.reduce(function(accumulator, elem){
                return accumulator.pixiContainer.$text.width/accumulator.pixiContainer.$text.scale.x + elem.pixiContainer.$text.width/elem.pixiContainer.$text.scale.x;
            });
            var winUpToCttWidth = winUpToWidth - 2 * winUpToPadding;
            if(textTotalWidth > winUpToCttWidth){
                sprScale = winUpToCttWidth / textTotalWidth;
            }
            var cttX = (winUpToWidth - textTotalWidth * sprScale)/2;
            spriteArr.forEach(function(elem, index, arr){
                var txtObj = elem.pixiContainer.$text;
                var prevElem = arr[index - 1];
                if(!prevElem){
                    txtObj.x = cttX;
                }else{
                    var prevTxtObj = prevElem.pixiContainer.$text;
                    txtObj.x = prevTxtObj.width + prevTxtObj.x - prevElem._currentStyle._width;
                }
                txtObj.scale.set(sprScale);
            });
        }
    }*/
    msgBus.subscribe('ticketCostChanged', onTicketCostChanged);
    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);

    return {};
});