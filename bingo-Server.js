(function() {
    var myID;
    var myPosition;
    var LOCATION_ROOT_URL = Script.resolvePath(".");        
    var BINGO_NUMBER_TOTAL = 75;
    var bingoNumbersNotCalled = [];
    var bingoNumbersCalled = [];
    var playerData = {"players": []};
    var bingoControllerWhitelist = ["Basinsky","Silverfish"];    
    var gearSound = SoundCache.getSound(LOCATION_ROOT_URL + "315753__vurca__running-gear.wav"); 
    var winnerSound = SoundCache.getSound(LOCATION_ROOT_URL + "456966__funwithsound__success-fanfare-trumpets.wav");
    var loserSound = SoundCache.getSound(LOCATION_ROOT_URL + "528956__beetlemuse__wrong-answer-incorrect-error.wav");   
    var userAccount;
    var userName;
    var userID;
    var cardColor = { r: 100, g: 200, b: 50 };
    var candidateID; 
    var candidateName;
    var bingoWinnerID;
    var bingoWinnerName;    
    var card =[];
    var cardStatus = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    var SCROLL_TIME_MS = 200;
    var TIME_TO_LOAD = 2000;
    var TOTAL_TIME_MS = 17 * SCROLL_TIME_MS;
    var CALLED_NUMBER_LINEHEIGHT = 0.24;    
    var randomNumber;
    var calledNumberTextID;
    var buttonGetCardID;
    var buttonStartID;
    var buttonResetID;
    var switchtCardID;
    var spinnerID;
    var bingoID;      
    var isRegistering = true;
    var isInProgress = false;    
    var isRunning = false;
    var isSendLostCard = false;
    var isSwitching = false;
    var isDocked = true;
    var isBingo = false;    
    var validBingo =[
        [0,5,10,15,20],
        [1,6,11,16,21],
        [2,7,17,22],
        [3,8,13,18,23],
        [4,9,14,19,24],
        [0,1,2,3,4],
        [5,6,7,8,9],
        [10,11,13,14],
        [15,16,17,18,19],
        [20,21,22,23,24],
        [0,6,18,24],
        [4,8,16,20]
    ];

    this.remotelyCallable = [
        "start",
        "reset",
        "getCard",
        "checkWinner",
        "switchCard",
        "updateButtonStatus"                  
    ];

    this.preload = function (entityID) {
        myID = entityID;
        myPosition = Entities.getEntityProperties(myID,["position"]).position;
    };

    this.start = function(id,param) {
        userAccount = param[2];
        print(userAccount);
        if (bingoControllerWhitelist.indexOf(userAccount) !== -1 && playerData.players.length > 0) {
            isInProgress = true;
            isRegistering = false;
            Entities.editEntity (buttonGetCardID,{backgroundColor: { r: 0, g: 0, b: 0 }});
            if (!isRunning) {
                isRunning = true;
                var newString = "";          
                if (bingoNumbersNotCalled.length >= 1) {
                    var injectorOptions = {
                        position: myPosition,
                        volume: 0.5,
                        localOnly: false            
                    };
                    var injector = Audio.playSound(gearSound, injectorOptions);
                    injector.restart();   
                    Entities.editEntity (spinnerID,{textColor: { r: 255, g: 255, b: 255 }});  
                    var timer = Script.setInterval(function () {
                        print(randomNumber);
                        randomNumber = Math.ceil((Math.random() * bingoNumbersNotCalled.length-1));
                        print(randomNumber);
                        Entities.editEntity (spinnerID,{text: bingoNumbersNotCalled[randomNumber]});
                    }, SCROLL_TIME_MS);

                    Script.setTimeout(function () {   
                        Script.clearInterval(timer);
                        Entities.editEntity (spinnerID,{textColor: { r: 0, g: 255, b: 0 }});               
                        bingoNumbersCalled.push(bingoNumbersNotCalled[randomNumber]);
                        bingoNumbersNotCalled.splice(randomNumber,1);                               
                        newString = arrayToString(bingoNumbersCalled);                                  
                        Entities.editEntity(calledNumberTextID,{text: newString, lineHeight: CALLED_NUMBER_LINEHEIGHT});
                        print("NotCalled" + JSON.stringify(bingoNumbersNotCalled));
                        print("Called" + JSON.stringify(bingoNumbersCalled));
                        isRunning = false;     
                    }, TOTAL_TIME_MS);
                }
            }            
        }
    };

    this.getCard = function(id,param) {
        candidateID = param[0];
        candidateName = param[1];
        userAccount = param[2];
        var candidateMethod = param[3];
        isSendLostCard = false;
        // give back that is allready registered if disconnected 
        if (candidateMethod === "lostCard" && isInProgress) {
            for (var k = 0; k < playerData.players.length; k++) {                    
                if (playerData.players[k].userAccount === userAccount) {                        
                    card = playerData.players[k].card;
                    var cardStatusSend = playerData.players[k].cardStatus;                         
                    playerData.players[k].id = candidateID;
                    print("give back card " + JSON.stringify(card));
                    Entities.callEntityClientMethod(candidateID,              
                        myID, 
                        "rezCard",[
                            JSON.stringify(cardColor),
                            JSON.stringify(card),
                            isDocked,
                            JSON.stringify(cardStatusSend),
                            JSON.stringify(bingoNumbersCalled)
                        ]
                    );
                    isSendLostCard = true;
                }
            }
        }
        // give new card
        if (candidateMethod === "button" && isRegistering && !isSendLostCard) {
            var newNumber = 0;
            for (var t = 0; t <= 25; t++) {                    
                if (t > 0 && t <= 5 ) {
                    newNumber = Math.ceil((Math.random() * 15));               
                    if (card.indexOf(newNumber) === -1) {                
                        card.push(newNumber);                
                    } else { 
                        t = t -1;
                    }                
                }

                if (t > 5 && t <= 10 ) {
                    newNumber = Math.ceil((Math.random() * 15)) + 15;
                    if (card.indexOf(newNumber) === -1) {                
                        card.push(newNumber);                
                    } else { 
                        t = t -1;
                    }          
                }

                if (t > 10 && t <= 15 ) {
                    newNumber = Math.ceil((Math.random() * 15)) + 30;
                    if (card.indexOf(newNumber) === -1) {                
                        card.push(newNumber);                
                    } else { 
                        t = t -1;
                    }          
                }

                if (t > 15 && t <= 20 ) {
                    newNumber = Math.ceil((Math.random() * 15)) + 45;
                    if (card.indexOf(newNumber) === -1) {                
                        card.push(newNumber);                
                    } else { 
                        t = t -1;
                    }          
                }

                if (t > 20  && t <= 25 ) {
                    newNumber = Math.ceil((Math.random() * 15)) + 60;
                    if (card.indexOf(newNumber) === -1) {                
                        card.push(newNumber);                
                    } else { 
                        t = t -1;
                    }          
                }
            }
            card[12] = "X";        

            if (!isSendLostCard) {
                var isRemoved = false;                      
                for (var i = 0; i < playerData.players.length; i++) {            
                    if (playerData.players[i].userAccount === userAccount) {
                        playerData.players.splice(i,1);               
                        isRemoved = true;
                        Entities.callEntityClientMethod(candidateID,              
                            myID, 
                            "deleteCard",
                            ["test"]
                        );
                        updatePlayerPanel();    
                    }                
                }
                if (!isRemoved) {                          
                    print("add to playerlist");
                    cardStatus = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
                    playerData.players.push({
                        "id": candidateID,
                        "name": candidateName,
                        "userAccount": userAccount,
                        "card": card,
                        "cardStatus": cardStatus
                    });
                    updatePlayerPanel(); 
                    print(JSON.stringify(playerData.players)); 
                    Entities.callEntityClientMethod(candidateID,              
                        myID, 
                        "rezCard",[
                            JSON.stringify(cardColor),
                            JSON.stringify(card),
                            isDocked,
                            JSON.stringify(cardStatus),
                            JSON.stringify(bingoNumbersCalled)
                        ]
                    );
                }
            }
            card = [];
        }
    };

    this.reset = function(id,param) {        
        userAccount = param[2];
        if (bingoControllerWhitelist.indexOf(userAccount) !== -1 && !isRunning) {
            for (var k = 0; k < playerData.players.length; k++) {
                Entities.callEntityClientMethod(playerData.players[k].id,              
                    myID, 
                    "deleteCard",
                    ["test"]
                );
            }            
            isBingo = false;
            isRegistering = true;
            isInProgress = false;
            isDocked = true;
            bingoNumbersNotCalled = [];
            bingoNumbersCalled = [];
            bingoWinnerName = "";
            bingoWinnerID = "";            
            playerData = {"players": []};
            // var cardStatus = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];    
            card =[];            
            Entities.editEntity(calledNumberTextID,{text: "",lineHeight: CALLED_NUMBER_LINEHEIGHT});
            Entities.editEntity(spinnerID,{text: ""});
            Entities.editEntity (buttonGetCardID,{backgroundColor: { r: 20, g: 255, b: 0 }});
            fillBingoArray();
            cardColor = { r: Math.ceil(Math.random()*254),
                g: Math.ceil(Math.random()*254),
                b: Math.ceil(Math.random()*254)
            };
        }               
    };

    this.checkWinner = function(id,param) {
        isBingo = false;        
        userID = param[0];
        userName = param[1];
        userAccount = param[2];
        if (isInProgress) {       
            for (var p = 0; p < playerData.players.length; p++) {
                if (userAccount === playerData.players[p].userAccount) {
                    var winnerCard = checkCard(userAccount);
                    if (winnerCard) {
                        var injectorOptions2 = {
                            position: myPosition,
                            volume: 0.5,
                            localOnly: false            
                        };
                        var injector2 = Audio.playSound(winnerSound, injectorOptions2);
                        injector2.restart();  
                        
                        print(userName + " has BINGO and wins the game");
                        isBingo = true;
                        isInProgress = false;
                        isRegistering = false;
                        bingoWinnerID = playerData.players[p].id;
                        bingoWinnerName = playerData.players[p].name;
                    
                        var winnerNameText = bingoWinnerName + " wins!";
                        var winnerNameLineHeight = 3.5/winnerNameText.length;

                        Entities.editEntity(calledNumberTextID,{
                            lineHeight: winnerNameLineHeight,
                            text: bingoWinnerName + " wins!"
                        });
                        Entities.callEntityClientMethod(playerData.players[p].id,              
                            myID, 
                            "showWinner",
                            ["test"]
                        );
                    } else {                   
                        var injectorOptions3 = {
                            position: myPosition,
                            volume: 1,
                            localOnly: false            
                        };
                        var injector3 = Audio.playSound(loserSound, injectorOptions3);
                        injector3.restart();  
                        print (userName + " did not have BINGO");
                        var loserNameText = "NO BINGO FOR " + playerData.players[p].name;
                        var loserNameLineHeight = 4/loserNameText.length;
                        Entities.editEntity(calledNumberTextID,{
                            lineHeight: loserNameLineHeight,
                            text: "NO BINGO FOR " + playerData.players[p].name + " !"
                        });
                        /* 
                        if (bingoControllerWhitelist.indexOf(userAccount) === -1 ) {
                        playerData.players.splice(p,1);
                        Entities.callEntityClientMethod(playerData.players[p].id,              
                            myID, 
                            "deleteCard",
                            ["test"]
                        );
                        //}
                        */
                    }                
                }                
            }
        }       
    };

    this.switchCard = function(id,param) {
        if (isInProgress && !isSwitching) {
            isSwitching = true;
            candidateID = param[0];
            candidateName = param[1];
            userAccount = param[2];
            for (var i = 0; i < playerData.players.length; i++) {    
                if (playerData.players[i].userAccount === userAccount) {
                    isDocked = !isDocked;
                    Entities.callEntityClientMethod(candidateID,              
                        myID, 
                        "rezCard",[
                            JSON.stringify(cardColor),
                            JSON.stringify(playerData.players[i].card),
                            isDocked,
                            JSON.stringify(playerData.players[i].cardStatus),
                            JSON.stringify(bingoNumbersCalled)
                        ]                        
                    );                    
                }
            }
            isSwitching = false;
        }       
    };

    this.updateButtonStatus = function(id,param) {        
        var userCheckingButtons = param[2];
        var numberStatus = param[3];
        var numberToggled = parseInt(param[4]);        
        for (var i = 0; i < playerData.players.length; i++) {    
            if (playerData.players[i].userAccount === userCheckingButtons) { 
                if (isInProgress) {                   
                    var status = playerData.players[i].cardStatus;  
                    status[numberToggled] = numberStatus;
                    playerData.players[i].cardStatus = status;
                }   
            }
        }
        userCheckingButtons = "";
    };

    function fillBingoArray() {
        for (var i = 0; i < BINGO_NUMBER_TOTAL; i++) {
            bingoNumbersNotCalled[i] = i + 1;            
        }          
        print(JSON.stringify(bingoNumbersNotCalled));
    }    

    function setupBingoEntities() {
        if (!spinnerID) {
            spinnerID = Entities.addEntity({
                type: "Text",        
                name: "Bingo-spinner",
                parentID: myID,            
                localPosition: { x: 0.6576, y: 1.7485, z: -0.2 },                     
                dimensions: { x: 1.6, y: 1.6, z: 0 },            
                text: "",
                lineHeight: 1.6,
                textColor: { r: 255, g: 255, b: 255 },
                backgroundAlpha: 1,
                backgroundColor: { r: 0, g: 0, b: 0 },  
                visible: true,
                unlit: true,
                font: "Roboto",
                textEffect: "none",
                textEffectColor: { r: 0, g: 0, b: 0 },     
                lifetime: -1,            
                userData: JSON.stringify({
                    grabbableKey: { grabbable: false, triggerable: false }
                })
            });
        }                      
        if (!calledNumberTextID) {
            calledNumberTextID = Entities.addEntity({
                type: "Text",        
                name: "Bingo-Called-Numbers",
                parentID: myID,            
                localPosition: { x: -2.173, y: -0.2, z: -0.2156 },
                dimensions: { x: 1.48, y: 4.5873, z: 0.01 },            
                text: "",
                lineHeight: 1.2,
                topMargin: 0.1,
                textColor: { r: 255, g: 255, b: 255 },
                backgroundAlpha: 1, 
                visible: true,
                unlit: true,
                font: "Roboto",
                textEffect: "none",
                textEffectColor: { r: 0, g: 0, b: 0 },     
                lifetime: -1,            
                userData: JSON.stringify({
                    grabbableKey: { grabbable: false, triggerable: false }
                })                                          
            });
        }

        if (!buttonStartID) {
            buttonStartID = Entities.addEntity({
                type: "Text",        
                name: "Bingo-Start",
                parentID: myID,
                script: LOCATION_ROOT_URL + "bingo-startButton.js?" + Date.now(),     
                localPosition: { x: -0.77, y: -1.247, z: 0 },
                dimensions: { x: 0.15, y: 0.12, z: 0.01 },            
                text: "START",
                lineHeight: 0.05,
                textColor: { r: 255, g: 255, b: 255 },
                backgroundAlpha: 1,
                backgroundColor: { r: 44, g: 119, b: 232 },  
                visible: true,
                unlit: true,
                font: "Roboto",
                textEffect: "none",
                textEffectColor: { r: 0, g: 0, b: 0 },     
                lifetime: -1,            
                userData: JSON.stringify({
                    grabbableKey: { grabbable: false, triggerable: true }
                })                                          
            });
        }

        if (!buttonResetID) {
            buttonResetID = Entities.addEntity({
                type: "Text",        
                name: "Bingo-Reset",
                parentID: myID,
                script: LOCATION_ROOT_URL + "bingo-resetButton.js?" + Date.now(),     
                localPosition: { x: -0.77, y: -1.7156, z: 0 },
                dimensions: { x: 0.15, y: 0.12, z: 0.01 },            
                text: "RESET",
                lineHeight: 0.05,
                textColor: { r: 255, g: 255, b: 255 },
                backgroundAlpha: 1, 
                backgroundColor: { r: 255, g: 183, b: 0 },  
                visible: true,
                unlit: true,
                font: "Roboto",
                textEffect: "none",
                textEffectColor: { r: 0, g: 0, b: 0 },     
                lifetime: -1,            
                userData: JSON.stringify({
                    grabbableKey: { grabbable: false, triggerable: true }
                })                                          
            });
        }

        if (!buttonGetCardID) {
            buttonGetCardID = Entities.addEntity({
                type: "Text",        
                name: "Bingo-getCard",
                parentID: myID,
                script: LOCATION_ROOT_URL + "bingo-getCardButton.js?" + Date.now(),     
                localPosition: { x: 2.5437, y: 0.1719, z: -0.01 },
                dimensions: { x: 1.05, y: 0.4844, z: 0.01 },            
                text: "CARD",
                lineHeight: 0.4,
                textColor: { r: 255, g: 255, b: 255 },
                backgroundAlpha: 1,
                backgroundColor: { r: 16, g: 194, b: 0 }, 
                visible: true,
                unlit: true,
                font: "Roboto",
                textEffect: "none",
                textEffectColor: { r: 0, g: 0, b: 0 },     
                lifetime: -1,            
                userData: JSON.stringify({
                    grabbableKey: { grabbable: false, triggerable: true }
                })                                          
            });
        }

        if (!switchtCardID) {
            switchtCardID = Entities.addEntity({
                type: "Text",        
                name: "Bingo-Switch",
                parentID: myID,
                script: LOCATION_ROOT_URL + "bingo-switch.js?" + Date.now(),     
                localPosition: { x: 2.5437, y: -0.6914, z: -0.01 },
                dimensions: { x: 1.05, y: 0.4844, z: 0.01 },            
                text: "DOCK",
                lineHeight: 0.4,
                textColor: { r: 150, g: 150, b: 150 },
                backgroundAlpha: 1, 
                visible: true,
                unlit: true,
                font: "Roboto",
                textEffect: "none",
                textEffectColor: { r: 0, g: 0, b: 0 },     
                lifetime: -1,            
                userData: JSON.stringify({
                    grabbableKey: { grabbable: false, triggerable: true }
                })                                          
            });
        }

        if (!bingoID) {
            bingoID = Entities.addEntity({
                type: "Text",        
                name: "Bingo-Winner",
                parentID: myID,
                script: LOCATION_ROOT_URL + "bingo-checkWinnerButton.js?" + Date.now(),                 
                localPosition: { x: 2.5437, y: -1.5518, z: -0.01 },
                dimensions: { x: 1.078, y: 0.4844, z: 0.01 },            
                text: "BINGO",
                lineHeight: 0.4,
                textColor: { r: 255, g: 255, b: 255 },
                backgroundAlpha: 1,
                backgroundColor: { r: 255, g: 128, b: 0 },  
                visible: true,
                unlit: true,
                font: "Roboto",
                textEffect: "none",
                textEffectColor: { r: 0, g: 0, b: 0 },     
                lifetime: -1,            
                userData: JSON.stringify({
                    grabbableKey: { grabbable: false, triggerable: true }
                })                                          
            });
        }
    }

    function arrayToString(array) {
        var string = "";
        if (array.length === 0) {
            string = "0";
        }
        if (array.length > 0) {            
            string = "Called: \n";
            for (var j = 0; j < bingoNumbersCalled.length; j++) {
                if (j % 4 === 0) {
                    string = string + "\n";
                }
                string = string + array[j] + "-";
            }
        }
        return string;
    }

    function checkCard(user) {
        for (var k = 0; k < playerData.players.length; k++) {
            if (user === playerData.players[k].userAccount) {
                isBingo = false;
                var cardToBeChecked = playerData.players[k].card;                            
                for (var m = 0; m < validBingo.length; m++) {
                    var valid = 0;
                    var check = validBingo[m];                        
                    for (var n = 0; n < check.length; n++) { 
                        if (bingoNumbersCalled.indexOf(cardToBeChecked[check[n]]) !== -1 ) {                               
                            valid++;
                        }                        
                    }
                    if (valid === check.length) {
                        isBingo = true;
                        print("test = true");
                        return true;
                    }                                                            
                }
            }
        }
        print("test = false");
        return false;   
    }

    function updatePlayerPanel() {
        var playersMerged = "Players: " + playerData.players.length + "\n";        
        if (playerData.players.length === 0) {           
            Entities.editEntity(calledNumberTextID, { text: playersMerged});           
        } else {
            for (var i = 0; i < playerData.players.length; i++) {       
                playersMerged = playersMerged + (i+1) +". " + playerData.players[i].name + "\n";                            
            }   
            Entities.editEntity(calledNumberTextID, { text: playersMerged, lineHeight: 0.18});            
            playersMerged = "";   
        }       
    } 

    
    // Start of program
    Script.setTimeout(function () {         
        fillBingoArray();        
        setupBingoEntities();        
    }, TIME_TO_LOAD);
});
