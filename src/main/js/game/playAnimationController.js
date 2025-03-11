/**
 * @module game/playAnimationController
 * @description 
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
    var kidsNum = 15,
        mamaNum = 5,
        revealedNum = 0;
    var result, prize, luck;
    var kidArray, mamaArray;
    var kidSymbols, mamaSymbols;
    var curChannel, channelIdArr = [1, 2, 3, 4];
    var tutorialVisible, autoReveal = false;
    var winMoney = 0;
    var winValue;
    var kidJumpTimeout, paywoodAnimTimeout, multiPaywoodAnimTimeout;
    var spriteAnimMap = {};

    function resetAll() {
        gr.getTimer().clearInterval(kidSymbols);
        gr.getTimer().clearInterval(mamaSymbols);
        kidArray = [];
        mamaArray = [];
        winMoney = 0;
        autoReveal = false;
        spriteAnimMap = {};
        for (var i = 1; i <= kidsNum; i++) {
            if (i < 10) {
                gr.lib['_kids0' + i].show(true);
                gr.lib['_kid0' + i + '_Mask'].show(false);
                gr.lib['_kidBorn0' + i].show(false);
                gr.lib['_kidJump0' + i].show(false);
                gr.lib['_kidXJump0' + i].show(false);
                gr.lib['_kidMatch0' + i].show(false);
                gr.lib['_PayWoodWin0' + i].show(false);
                gr.lib['_2xAnim0' + i].show(false);
                gr.lib['_5xAnim0' + i].show(false);
                gr.lib['_payWood0' + i].setImage('PayWood');
                gr.lib['_text0' + i].show(false);
                gr.lib['_kids0' + i].animated = false;
                gr.lib['_kids0' + i].revealFlag = false;
                gr.lib['_kids0' + i].revealed = false;
                gr.lib['_kids0' + i].matched = false;
                kidArray.push(gr.lib['_kids0' + i]);
            } else {
                gr.lib['_kids' + i].show(true);
                gr.lib['_kid' + i + '_Mask'].show(false);
                gr.lib['_kidBorn' + i].show(false);
                gr.lib['_kidJump' + i].show(false);
                gr.lib['_kidXJump' + i].show(false);
                gr.lib['_kidMatch' + i].show(false);
                gr.lib['_PayWoodWin' + i].show(false);
                gr.lib['_2xAnim' + i].show(false);
                gr.lib['_5xAnim' + i].show(false);
                gr.lib['_payWood' + i].setImage('PayWood');
                gr.lib['_text' + i].show(false);
                gr.lib['_kids' + i].animated = false;
                gr.lib['_kids' + i].revealFlag = false;
                gr.lib['_kids' + i].revealed = false;
                gr.lib['_kids' + i].matched = false;
                kidArray.push(gr.lib['_kids' + i]);
            }
        }

        for (i = 1; i <= mamaNum; i++) {
            gr.lib['_mother0' + i].show(true);
            gr.lib['_mother0' + i + '_Mask'].show(false);
            gr.lib['_sweater0' + i].show(false);
            gr.lib['_makeSweaterBody0' + i].show(false);
            gr.lib['_hand0' + i].show(false);
            gr.lib['_motherMatch0' + i].show(false);
            gr.lib['_mother0' + i].animated = false;
            gr.lib['_mother0' + i].revealFlag = false;
            gr.lib['_mother0' + i].revealed = false;
            gr.lib['_mother0' + i].matched = false;
            mamaArray.push(gr.lib['_mother0' + i]);
        }
    }

    function checkAllRevealed() {
        var isAllRevealed = true;
        var symbol = null;
        var symbolsArray = kidArray.concat(mamaArray);
        for (var i = 0; i < symbolsArray.length; i++) {
            symbol = symbolsArray[i];
            if (!symbol.revealed) {
                isAllRevealed = false;
                break;
            }
        }
        if (isAllRevealed) {
            darkenUnmatched();
            if (winMoney < winValue) {
                msgBus.publish('winBoxError', { errorCode: '29000', errorDescriptionSpecific: ' ' });
            } else if (winMoney > winValue) {
                return;
            } else {
                msgBus.publish('allKidAndMamaRevealed');
            }
        }
        //return isAllRevealed;
    }

    function random(length) {
        return Math.floor(Math.random() * length);
    }

    function delFromArray(arr, elem) {
        for (var i = 0; i < arr.length; i++) {
            if (elem === arr[i]) {
                arr.splice(i, 1);
            }
        }
        return arr;
    }

    function checkAllAnimated(animTarArray) {
        var isAllAnimated = true;
        for (var i = 0; i < animTarArray.length; i++) {
            if (!animTarArray[i].animated) {
                isAllAnimated = false;
                break;
            }
        }
        return isAllAnimated;
    }

    function randomAnimSymbols(animTarArray, animName, speed) {
        if (animTarArray.length > 0) {
            for (var i = 0; i < animTarArray.length; i++) {
                var symRand = random(animTarArray.length);
                var tar = animTarArray[symRand];
                if (!tar.animated) {
                    tar.animated = true;
                    tar.gotoAndPlay(animName, speed);
                    if (!autoReveal) {
                        tar.pixiContainer.$sprite.interactive = true;
                        tar.pixiContainer.$sprite.cursor = 'pointer';
                    }
                    break;
                } else {
                    continue;
                }
            }
        }
    }

    function darkenUnmatched() {
        var num;
        for (var i = 0; i < kidsNum; i++) {
            num = i + 1;
            if (num < 10) {
                num = '0' + num;
            }
            if (!gr.lib['_kids' + num].matched) {
                gr.lib['_kid' + num + '_Mask'].show(true);
            }
        }
        for (var k = 0; k < mamaNum; k++) {
            num = k + 1;
            if (!gr.lib['_mother0' + num].matched) {
                gr.lib['_mother0' + num + '_Mask'].show(true);
            }
        }
    }

    function generateChannelId() {
        curChannel = curChannel || 0;
        var idArr = channelIdArr;
        var idx = idArr.indexOf(curChannel);
        return idArr[(idx + 1) % idArr.length];
    }

    function onStartUserInteraction(data) {
        gr.lib._loadingIcon.stopPlay();
        gr.lib._loadingIcon.show(false);
        if (!data.scenario) {
            return;
        }
        if (data.playResult === 'WIN') {
            winValue = data.prizeValue;
        } else {
            winValue = 0;
        }
        revealedNum = 0;
        var sepIdx = data.scenario.indexOf('|');
        var yn = data.scenario.substring(sepIdx + 1);
        var wn = data.scenario.substring(0, sepIdx);
        var winTextStyle = { align: 'center', fill: '#39ceff', stroke: '#5236ff', strokeThickness: 4 };
        var prizeTextStyle = { align: 'center', fill: '#fbf15a', stroke: '#6b2110', strokeThickness: 4 };
        result = yn.match(/[0-9A-Z]+:/g).join('').match(/[0-9A-Z]+/g);
        prize = yn.match(/:[0-9A-Z]+/g).join('').match(/[0-9A-Z]+/g);
        luck = wn.split(',');
        kidSymbols = gr.getTimer().setInterval(function() {
            if (kidArray.length) {
                if (!checkAllAnimated(kidArray)) {
                    if (kidArray.length > 0) {
                        randomAnimSymbols(kidArray, 'egg', 0.5);
                    }
                } else {
                    for (var i in kidArray) {
                        kidArray[i].animated = false;
                    }
                }
            } else {
                gr.getTimer().clearInterval(kidSymbols);
            }
        }, 1500);
        mamaSymbols = gr.getTimer().setInterval(function() {
            if (mamaArray.length) {
                if (!checkAllAnimated(mamaArray)) {
                    if (mamaArray.length > 0) {
                        randomAnimSymbols(mamaArray, 'mother', 0.1);
                    }
                } else {
                    for (var i in mamaArray) {
                        mamaArray[i].animated = false;
                    }
                }
            } else {
                gr.getTimer().clearInterval(mamaSymbols);
            }
        }, 1000);

        function setKidRevealAction(kid, resultValue, prizeValue) {
            function setAnimation(kidIdx) {
                gr.lib['_kidBorn' + kidIdx].show(true);
                gr.lib['_kidBorn' + kidIdx].gotoAndPlay('bornNO' + resultValue, 0.4);
                checkMatchOrNot(kid, resultValue);

                kidJumpTimeout = gr.getTimer().setTimeout(function() {
                    gr.lib['_kidBorn' + kidIdx].show(false);
                    if (resultValue >= 40) {
                        gr.lib['_kidJump' + kidIdx].show(false);
                        gr.lib['_kidXJump' + kidIdx].show(true);
                        gr.lib['_kidXJump' + kidIdx].gotoAndPlay('kidJumpNO' + resultValue, 0.5, true);
                    } else {
                        gr.lib['_kidXJump' + kidIdx].show(false);
                        gr.lib['_kidJump' + kidIdx].show(true);
                        gr.lib['_kidJump' + kidIdx].onComplete = function() {
                            if (kid.matched) {
                                highlightMatched(resultValue, checkAllRevealed);
                            }
                        };
                        gr.lib['_kidJump' + kidIdx].gotoAndPlay('kidJumpNO' + resultValue, 0.5);
                        spriteAnimMap[gr.lib['_kidJump' + kidIdx].data._name] = gr.lib['_kidJump' + kidIdx];
                    }
                    setPrizeText(kidIdx);
                }, 550);
                paywoodAnimTimeout = gr.getTimer().setTimeout(function() {
                    if (resultValue < 40) {
                        kid.revealed = true;
                        delFromArray(kidArray, kid);
                        if (kid.matched) {
                            curChannel = generateChannelId();
                            audio.play('RevealWin0', 'RevealWin0' + curChannel);
                            gr.lib['_payWood' + kidIdx].setImage('PayWoodWin');
                            gameUtils.setTextStyle(gr.lib['_text' + kidIdx], winTextStyle);
                            gr.lib['_PayWoodWin' + kidIdx].show(true);
                            gr.lib['_PayWoodWin' + kidIdx].gotoAndPlay('WinPay', 0.5, true);
                        } else {
                            checkAllRevealed();
                        }
                    } else {
                        gr.lib['_payWood' + kidIdx].setImage('PayWoodWin');
                        if (resultValue === 40) {
                            audio.play('RevealWinFireArrow', 'RevealWinFireArrow' + curChannel);
                            gameUtils.setTextStyle(gr.lib['_text' + kidIdx], winTextStyle);
                            gr.lib['_PayWoodWin' + kidIdx].show(true);
                            gr.lib['_PayWoodWin' + kidIdx].gotoAndPlay('WinPay', 0.5, true);
                            setMetersWinValue(prizeValue);
                            kid.revealed = true;
                            delFromArray(kidArray, kid);
                            checkAllRevealed();
                        } else {
                            if (resultValue === 41) {
                                gr.lib['_2xAnim' + kidIdx].show(true);
                                gr.animMap['_double_Anim' + kidIdx].play();
                                prizeValue = prizeValue * 2;
                            } else if (resultValue === 42) {
                                gr.lib['_5xAnim' + kidIdx].show(true);
                                gr.animMap['_multi_Anim' + kidIdx].play();
                                prizeValue = prizeValue * 5;
                            }
                            audio.play('RevealWinMultiplier', 'RevealWinMultiplier' + curChannel);
                            multiPaywoodAnimTimeout = gr.getTimer().setTimeout(function() {
                                gr.lib['_text' + kidIdx].setText(SKBeInstant.formatCurrency(prizeValue).formattedAmount);
                                gameUtils.setTextStyle(gr.lib['_text' + kidIdx], winTextStyle);
                                gr.lib['_PayWoodWin' + kidIdx].show(true);
                                gr.lib['_PayWoodWin' + kidIdx].gotoAndPlay('WinPay', 0.5, true);
                                setMetersWinValue(prizeValue);
                                kid.revealed = true;
                                delFromArray(kidArray, kid);
                                checkAllRevealed();
                            }, 1500);
                        }
                    }
                }, 800);
            }

            function setPrizeText(kidIdx) {
                gr.lib['_text' + kidIdx].show(true);
                gr.lib['_text' + kidIdx].autoFontFitText = true;
                gr.lib['_text' + kidIdx].setText(SKBeInstant.formatCurrency(prizeValue).formattedAmount);
                gameUtils.setTextStyle(gr.lib['_text' + kidIdx], prizeTextStyle);
            }
            for (var i = 0; i < data.prizeTable.length; i++) {
                if (prizeValue === data.prizeTable[i].description) {
                    prizeValue = data.prizeTable[i].prize;
                    break;
                }
            }
            kid.prize = prizeValue;
            kid.reveal = function() {
                if (!kid.revealFlag && !tutorialVisible) {
                    revealedNum++;
                    if (revealedNum === mamaNum + kidsNum) {
                        msgBus.publish('disableUI');
                        msgBus.publish('revealTheLastSymbol');
                    }
                    kid.revealFlag = true;
                    var symbolName = kid.getName();
                    var nameNum = symbolName.match(/[0-9]+/).join();
                    kid.off('click', this.clickListner);
                    kid.pixiContainer.$sprite.interactive = false;
                    kid.pixiContainer.$sprite.cursor = 'auto';
                    kid.show(false);
                    curChannel = generateChannelId();
                    if (resultValue === 'X') {
                        resultValue = 41;
                    } else if (resultValue === 'I') {
                        resultValue = 40;
                    } else if (resultValue === 'M') {
                        resultValue = 42;
                    }
                    if (autoReveal) {
                        audio.play('RevealMiss0AutoPlay', 'RevealMiss0AutoPlay' + curChannel);
                    } else {
                        audio.play('RevealMiss0', 'RevealMiss0' + curChannel);
                    }
                    setAnimation(nameNum);
                }
            };
        }

        function setMamaRevealAction(mama, luckValue) {
            var mamaBoundary = [{ x: 19, y: 105 }, { x: 49, y: 139 }, { x: 96, y: 153 }, { x: 157, y: 133 }, { x: 178, y: 69 }, { x: 125, y: 58 }, { x: 77, y: 0 }];
            mama.reveal = function(event) {
                if (event) {
                    var localPoint = mama.toLocal(event.data.global);
                    if (gameUtils.judgeHotSpot(mamaBoundary, localPoint) === false) {
                        return;
                    }
                }
                if (!mama.revealFlag && !tutorialVisible) {
                    revealedNum++;
                    if (revealedNum === mamaNum + kidsNum) {
                        msgBus.publish('disableUI');
                        msgBus.publish('revealTheLastSymbol');
                    }
                    mama.revealFlag = true;
                    mama.off('click', this.clickListner);
                    mama.pixiContainer.$sprite.interactive = false;
                    mama.pixiContainer.$sprite.cursor = 'auto';
                    mama.show(false);
                    var symbolName = mama.getName();
                    var momNum = symbolName.match(/[0-9]+/).join();
                    gr.lib['_makeSweaterBody' + momNum].show(true);
                    gr.lib['_hand' + momNum].show(true);
                    gr.lib['_sweater' + momNum].show(true);
                    curChannel = generateChannelId();
                    audio.play('RevealMiss1', 'RevealMiss1' + curChannel);
                    checkMatchOrNot(mama, luckValue);
                    gr.lib['_sweater' + momNum].onComplete = function() {
                        gr.lib['_makeSweaterBody' + momNum].stopPlay();
                        gr.lib['_hand' + momNum].stopPlay();
                        mama.revealed = true;
                        delFromArray(mamaArray, mama);
                        if (mama.matched) {
                            curChannel = generateChannelId();
                            audio.play('RevealWin1', 'RevealWin1' + curChannel);
                            highlightMatched(luckValue, checkAllRevealed);
                        } else {
                            checkAllRevealed();
                        }
                    };
                    gr.lib['_makeSweaterBody' + momNum].gotoAndPlay('sweaterBody', 0.3, true);
                    gr.lib['_hand' + momNum].gotoAndPlay('sweaterHand', 0.3, true);
                    gr.lib['_sweater' + momNum].gotoAndPlay('sweaterNO' + luckValue, 0.3);
                    spriteAnimMap[gr.lib['_sweater' + momNum].data._name] = gr.lib['_sweater' + momNum];
                }
            };
        }

        function handleRevealAction(symbol, index) {
            var _THIS = symbol;
            _THIS.revealFlag = false;
            _THIS.revealed = false;
            _THIS.pixiContainer.$sprite.interactive = true;
            _THIS.pixiContainer.$sprite.cursor = 'pointer';
            var name = _THIS.getName();
            if (name.indexOf('kids') > -1) {
                setKidRevealAction(_THIS, result[index], prize[index]);
            } else if (name.indexOf('mother') > -1) {
                setMamaRevealAction(_THIS, luck[index]);
            }
            var SymbolGB = new gladButton(_THIS, null, { 'avoidMultiTouch': true });
            _THIS.clickListner = SymbolGB.click(function() {
                _THIS.reveal();
            });
        }
        for (var i = 0; i < kidArray.length; i++) {
            handleRevealAction(kidArray[i], i);
        }
        for (var k = 0; k < mamaArray.length; k++) {
            handleRevealAction(mamaArray[k], k);
        }
        /*audio.play('GameInit');*/
        function checkMatchOrNot(target, number) {
            if (number >= 40) {
                target.matched = true;
                return;
            }
            var wnIdx = luck.indexOf(number) + 1,
                ynIdx = result.indexOf(number) + 1;
            wnIdx = wnIdx.toString().length < 2 ? '0' + wnIdx : wnIdx;
            ynIdx = ynIdx.toString().length < 2 ? '0' + ynIdx : ynIdx;

            if (wnIdx !== '00' && ynIdx !== '00') {
                if (gr.lib['_mother' + wnIdx].revealFlag && gr.lib['_kids' + ynIdx].revealFlag) {
                    target.matched = true;
                } else {
                    target.matched = false;
                }
            } else {
                target.matched = false;
            }
        }

        function highlightMatched(number, callback) {
            var wnIdx = luck.indexOf(number) + 1,
                ynIdx = result.indexOf(number) + 1;
            wnIdx = wnIdx.toString().length < 2 ? '0' + wnIdx : wnIdx;
            ynIdx = ynIdx.toString().length < 2 ? '0' + ynIdx : ynIdx;
            setMetersWinValue(gr.lib['_kids' + ynIdx].prize);
            if (!gr.lib['_motherMatch' + wnIdx].playing) {
                gr.lib['_mother' + wnIdx].matched = true;
                gr.lib['_motherMatch' + wnIdx].show(true);
                gr.lib['_makeSweaterBody' + wnIdx].setImage('sweaterBodyMatch'); //make the matched mama close her eyes
                gr.lib['_motherMatch' + wnIdx].onComplete = function() {
                    callback();
                };
                gr.lib['_motherMatch' + wnIdx].gotoAndPlay('motherMatch', 0.5, true);
                spriteAnimMap[gr.lib['_motherMatch' + wnIdx].data._name] = gr.lib['_motherMatch' + wnIdx];
            }
            if (!gr.lib['_kidMatch' + ynIdx].playing) {
                gr.lib['_kids' + ynIdx].matched = true;
                gr.lib['_kidJump' + ynIdx].show(false);
                gr.lib['_payWood' + ynIdx].setImage('PayWoodWin');
                gr.lib['_PayWoodWin' + ynIdx].show(true);
                gr.lib['_PayWoodWin' + ynIdx].gotoAndPlay('WinPay', 0.5, true);
                gr.lib['_kidMatch' + ynIdx].show(true);
                gr.lib['_kidMatch' + ynIdx].gotoAndPlay('kidMatchNO' + number, 0.5, true);
                gameUtils.setTextStyle(gr.lib['_text' + ynIdx], winTextStyle);
                callback();
            }
        }
    }

    function setMetersWinValue(win) {
        winMoney += win;
        if (winMoney > winValue) {
            msgBus.publish('winBoxError', { errorCode: '29000', errorDescriptionSpecific: ' ' });
            return;
        }
        gr.lib._winsValue.setText(SKBeInstant.formatCurrency(winMoney).formattedAmount);
        gameUtils.fixMeter(gr);
    }

    function onReStartUserInteraction(data) {
        onStartUserInteraction(data);
    }

    function onReInitialize() {
        stopAllGladAnim();
        stopAllSpriteAnim();
        if (kidJumpTimeout) {
            gr.getTimer().clearTimeout(kidJumpTimeout);
        }
        if (paywoodAnimTimeout) {
            gr.getTimer().clearTimeout(paywoodAnimTimeout);
        }
        if (multiPaywoodAnimTimeout) {
            gr.getTimer().clearTimeout(multiPaywoodAnimTimeout);
        }
        resetAll();
    }

    function onGameParametersUpdated() {
        prepareAudio();
        cloneGladAnim();
        var numberTextStyle = { padding: 10, stroke: "#134403", strokeThickness: 3, fill: ["#bcff99", "#51ff27"], dropShadow: true, dropShadowColor: '#121b01', dropShadowAlpha: 0.2, dropShadowBlur: 2, dropShadowDistance: 3 };
        gr.lib._yourNumberText.autoFontFitText = true;
        gr.lib._yourNumberText.setText(loader.i18n.Game.your_number);
        gameUtils.setTextStyle(gr.lib._yourNumberText, numberTextStyle);

        gr.lib._luckyNumberText.autoFontFitText = true;
        gr.lib._luckyNumberText.setText(loader.i18n.Game.lucy_number);
        gameUtils.setTextStyle(gr.lib._luckyNumberText, numberTextStyle);

        resetAll();
    }

    function cloneGladAnim() {
        for (var i = 1; i <= kidsNum; i++) {
            var animIdx = i;
            if (i < 10) {
                animIdx = '0' + animIdx;
            }
            gr.animMap._double_Anim01.clone(['_2xAnim' + animIdx], '_double_Anim' + animIdx);
            gr.animMap._multi_Anim01.clone(['_5xAnim' + animIdx], '_multi_Anim' + animIdx);
        }
    }

    function stopAllGladAnim() {
        for (var p in gr.animMap) {
            gr.animMap[p].stop();
        }
    }

    function stopAllSpriteAnim() {
        for (var key in spriteAnimMap) {
            if (spriteAnimMap[key].isPlaying) {
                spriteAnimMap[key].onComplete = null;
                spriteAnimMap[key].stopPlay();
            }
        }
    }

    function onPlayerWantsPlayAgain() {
        stopAllGladAnim();
        resetAll();
    }

    function onTutorialIsHide() {
        tutorialVisible = false;
    }

    function onTutorialIsShown() {
        tutorialVisible = true;
    }

    function onStartRevealAll() {
        autoReveal = true;
    }

    function onStopRevealAll() {
        autoReveal = false;
    }

    function prepareAudio() {
        for (var i = 0; i < channelIdArr.length; i++) {
            var cIdx = channelIdArr[i];
            audio.play('RevealMiss0AutoPlay', 'RevealMiss0AutoPlay' + cIdx);
            audio.stopChannel('RevealMiss0AutoPlay' + cIdx);
            audio.play('RevealMiss0', 'RevealMiss0' + cIdx);
            audio.stopChannel('RevealMiss0' + cIdx);
            audio.play('RevealWin0', 'RevealWin0' + cIdx);
            audio.stopChannel('RevealWin0' + cIdx);
            audio.play('RevealMiss1', 'RevealMiss1' + cIdx);
            audio.stopChannel('RevealMiss1' + cIdx);
            audio.play('RevealWin1', 'RevealWin1' + cIdx);
            audio.stopChannel('RevealWin1' + cIdx);
            audio.play('RevealWinFireArrow', 'RevealWinFireArrow' + cIdx);
            audio.stopChannel('RevealWinFireArrow' + cIdx);
            audio.play('RevealWinMultiplier', 'RevealWinMultiplier' + cIdx);
            audio.stopChannel('RevealWinMultiplier' + cIdx);
        }
    }
    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
    msgBus.subscribe('jLottery.reInitialize', onReInitialize);
    msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
    msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
    msgBus.subscribe('playerWantsPlayAgain', onPlayerWantsPlayAgain);
    msgBus.subscribe('tutorialIsShown', onTutorialIsShown);
    msgBus.subscribe('tutorialIsHide', onTutorialIsHide);
    msgBus.subscribe('startRevealAll', onStartRevealAll);
    msgBus.subscribe('stopRevealAll', onStopRevealAll);

    return {};
});