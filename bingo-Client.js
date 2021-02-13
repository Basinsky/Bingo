(function() {
    var myID;    
    var cardID = "";
    var reset = false;
    var RESET_TIME = 500;     
    var LOCATION_ROOT_URL = Script.resolvePath(".");
    var buttonID;    
    var BUTTON_WIDTH = 0.325; // 0.25
    var BUTTON_HEIGHT = 0.325; // 0.25
    var SPACE = 0.052; // 0.04
    var SCALE = 5.2;
    var buttons = [];
    var cardStatus = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];    
    var clickSound = SoundCache.getSound(LOCATION_ROOT_URL + "448086__breviceps__normal-click.wav"); 
    var bingoUser;
    var bingoWinnerImageURL = LOCATION_ROOT_URL + "Bingo-winner.png";
    var bingoWinnerParticleURL = LOCATION_ROOT_URL + "Confetti.png";
    var winnerLogoID;
    var winnerParticleID;
    var calledNumbersID; 
    var isDocked;  
    
    this.remotelyCallable = [
        "rezCard",
        "deleteCard",        
        "showWinner",
        "updateCalled"                         
    ];

    this.preload = function (entityID) {
        myID = entityID;
        bingoUser = AccountServices.username;
            
        if (cardID === "") {
            Entities.callEntityServerMethod(              
                myID, 
                "getCard",
                [MyAvatar.sessionUUID,MyAvatar.displayName,bingoUser,"lostCard"]
            );
        }        
    };    

    this.rezCard = function(id,param) {
        buttons = [];       
        deleteLocalEntities();
        var inFrontAvatar = Vec3.sum(
            MyAvatar.position,
            Vec3.multiplyQbyV(MyAvatar.orientation, { x: 0, y: 0.3, z: -0.6 }));        
        var cardRotation = MyAvatar.orientation;
        cardRotation = Quat.multiply(cardRotation,Quat.fromPitchYawRollDegrees(-45, 0, 0 ));

        var cardColor = JSON.parse(param[0]);
        var card = JSON.parse(param[1]);
        isDocked = JSON.parse(param[2]);
        cardStatus = JSON.parse(param[3]);      
        var numbersCalled = JSON.parse(param[4]);
        var newText = arrayToString(numbersCalled);
        print("got send" + JSON.stringify(cardStatus));     
        var cardx;
        var cardy;
        var counter = 0;
        if (isDocked) {
            cardx = 5 * BUTTON_WIDTH + 6 * SPACE;
            cardy = 5 * BUTTON_HEIGHT + 6 * SPACE;
            cardID = Entities.addEntity({
                type: "Shape",
                shape: "Cube",
                name: "bingoCard",
                parentID: myID,
                localPosition: { x: 0.53, y: -0.78, z: 0.07 },            
                collisionless: true,
                unlit: true,
                color: cardColor,
                userData: JSON.stringify({
                    grabbableKey: { grabbable: false, triggerable: false }
                }),    
                dimensions: { x: cardx, y: cardy, z: SPACE },
                lifetime: -1 // Delete after 5 minutes.
            },"local");            
        } else {
            cardx = 5 * BUTTON_WIDTH/SCALE + 6 * SPACE/SCALE;
            cardy = (5 * BUTTON_HEIGHT/SCALE + 6 * SPACE/SCALE) * 1.5 ;
            cardID = Entities.addEntity({
                type: "Shape",
                shape: "Cube",
                name: "bingoCard",
                parentID: MyAvatar.sessionUUID,                
                position: inFrontAvatar,
                rotation: cardRotation,            
                collisionless: true,
                unlit: true,
                color: cardColor,
                userData: JSON.stringify({
                    grabbableKey: { grabbable: true, triggerable: false }
                }),    
                dimensions: { x: cardx, y: cardy, z: SPACE/SCALE },
                lifetime: -1 // Delete after 5 minutes.
            },"local");             
        
            calledNumbersID = Entities.addEntity({
                type: "Text",        
                name: "Bingo-Called-Numbers",
                parentID: cardID,            
                localPosition: { x: 0, y: -cardy/2.8, z: 0.01 },
                dimensions: { x: cardx*0.9, y: cardy/3, z: 0.01 },            
                text: newText,                
                lineHeight: cardy/25,
                textColor: { r: 255, g: 255, b: 255 },
                backgroundAlpha: 0, 
                visible: true,
                unlit: true,
                font: "Roboto",
                textEffect: "none",
                textEffectColor: { r: 0, g: 0, b: 0 },     
                lifetime: -1,            
                userData: JSON.stringify({
                    grabbableKey: { grabbable: false, triggerable: false }
                })                                          
            },"local");
            
        }

        for (var xcounter = 0; xcounter < card.length/5; xcounter++) {
            for (var ycounter = 0; ycounter < card.length/5; ycounter++) {
                var buttonPos;
                var ofsett;
                var newButtonPos;
                var newDimensions;
                var newLineHeight;
                if (isDocked) {
                    buttonPos = {
                        x: (BUTTON_WIDTH+SPACE)*xcounter,
                        y: -(BUTTON_HEIGHT+SPACE)*ycounter,
                        z: SPACE};
                    ofsett = {
                        x: -cardx/2 + SPACE + BUTTON_WIDTH/2 ,
                        y: cardy/2 - SPACE - BUTTON_HEIGHT/2,
                        z: 0};                
                    newButtonPos = Vec3.sum(buttonPos,ofsett);
                    newDimensions = { x: BUTTON_WIDTH, y: BUTTON_HEIGHT, z: 0 };
                    newLineHeight = BUTTON_HEIGHT-SPACE;
                } else {
                    buttonPos = {
                        x: (BUTTON_WIDTH/SCALE+SPACE/SCALE)*xcounter ,
                        y: -(BUTTON_HEIGHT/SCALE+SPACE/SCALE)*ycounter,
                        z: 0.02};
                    ofsett = {
                        x: -cardx/2 + SPACE/SCALE + BUTTON_WIDTH/(2*SCALE),
                        y: cardy/2 - SPACE/SCALE - BUTTON_HEIGHT/(2*SCALE),
                        z: 0};                
                    newButtonPos = Vec3.sum(buttonPos,ofsett);
                    newDimensions = { x: BUTTON_WIDTH/SCALE, y: BUTTON_HEIGHT/SCALE, z: 0 };
                    newLineHeight = BUTTON_HEIGHT/SCALE-SPACE/SCALE;
                }

                var statusColor;
                var statusBackGroundColor; 
                print ("cardcounter"+ cardStatus[counter]);
                if (cardStatus[counter] === 0) {
                    statusColor = {r: 255,g: 255,b: 255};
                    statusBackGroundColor = {r: 0,g: 0,b: 0};                          
                } else {
                    statusColor ={r: 0,g: 0,b: 0};
                    statusBackGroundColor = {r: 255,g: 255,b: 255};
                }
                                 
                buttonID = Entities.addEntity({
                    type: "Text",        
                    name: "BingoNumber",
                    collisionless: true,
                    parentID: cardID,                       
                    localPosition: newButtonPos,
                    dimensions: newDimensions,            
                    text: card[counter],
                    lineHeight: newLineHeight,                   
                    textColor: statusColor,
                    backgroundColor: statusBackGroundColor,   
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
                },"local");                
                buttons.push(buttonID);
                counter++;  
            }                
        }        
    };

    this.deleteCard = function(id,param) {
        if (cardID !== "") {
            Entities.deleteEntity(cardID);
            if (winnerLogoID) {
                Entities.deleteEntity(winnerLogoID);
            }
            if (winnerParticleID) {
                Entities.deleteEntity(winnerParticleID);
            }
        }        
    };

    this.updateCalled = function(id,param) {
        if (!isDocked) {
            var numbers = JSON.parse(param[0]);
            var calledText = arrayToString(numbers);
            if (calledNumbersID) {
                Entities.editEntity(calledNumbersID,{text: calledText});
            }
        }
    };

    this.showWinner = function(id,param) {
        winnerLogoID = Entities.addEntity({
            type: "Image",        
            name: "Bingo-Called-Numbers",
            parentID: MyAvatar.sessionUUID,
            imageURL: bingoWinnerImageURL,            
            localPosition: { x: 0, y: 1, z: 0.07 },
            localRotation: Quat.IDENTITY,
            dimensions: { x: 1, y: 1, z: 0.01 },            
            billboardMode: "yaw",                
            visible: true,
            emissive: true,
            collisionless: true,  
            lifetime: -1,            
            userData: JSON.stringify({
                grabbableKey: { grabbable: false, triggerable: false }
            })                                          
        },"avatar");
        
        winnerParticleID = Entities.addEntity({
            type: "ParticleEffect",        
            name: "Bingo-Winner-Particle",
            parentID: MyAvatar.sessionUUID,
            textures: bingoWinnerParticleURL,            
            localPosition: { x: 0, y: 0.9, z: 0},
            localRotation: Quat.fromPitchYawRollDegrees(-180, 90, 0 ),
            dimensions: { x: 1, y: 1, z: 0.01},
            lifespan: 2,            
            maxParticles: 500,
            speedSpread: 0.2,
            emitRate: 200,
            emitSpeed: -3,
            shapeType: "circle",
            emitDimensions: { x: 0, y: 0.5, z: 0},                
            radiusStart: 0.02,
            particleRadius: 0.05,
            radiusFinish: 0.1,
            colorStart: { r: 0, g: 0, b: 0},
            color: { r: 0, g: 0, b: 0},
            colorFinish: { r: 0, g: 0, b: 0},
            colorSpread: { r: 255, g: 255, b: 255},
            alphaStart: 1,
            alpha: 1,
            alphaFinish: 1,
            emitAcceleration: { x: 0, y: -4, z: 0},
            accelerationSpread: { x: 1, y: 0, z: 1},
            lifetime: -1,            
            userData: JSON.stringify({
                grabbableKey: { grabbable: false, triggerable: false }
            })                                          
        },"avatar");
    };

    Entities.mousePressOnEntity.connect(function (entityID, event) {
        // Signal is triggered for all entities.
        if (reset && buttons.length > 0) {
            if (buttons.indexOf(entityID) !== -1) { 
                var injectorOptions;
                injectorOptions = {
                    position: MyAvatar.position,
                    volume: 0.1,
                    localOnly: true            
                };
                Audio.playSound(clickSound, injectorOptions); 
               
                var buttonStatus;
                var buttonNumber = buttons.indexOf(entityID);
                var statusColor = Entities.getEntityProperties(entityID,["backgroundColor"]).backgroundColor;
                if (statusColor.r === 0) {
                    buttonStatus = 0;
                } else { 
                    buttonStatus = 1;
                }
                
                switch (true) {
                    case buttonStatus === 0:                        
                        Entities.editEntity(entityID,{
                            textColor: {r: 0,g: 0,b: 0},
                            backgroundColor: {r: 255,g: 255,b: 255}            
                        });
                        break;
                    case buttonStatus === 1:                        
                        Entities.editEntity(entityID,{
                            textColor: {r: 255,g: 255,b: 255},
                            backgroundColor: {r: 0,g: 0,b: 0}            
                        });
                        break;                                        
                }                 
            }
            
            Entities.callEntityServerMethod(              
                myID, 
                "updateButtonStatus",
                [MyAvatar.sessionUUID,MyAvatar.displayName,bingoUser,buttonStatus,buttonNumber]
            );
            reset = false;
        }
    }); 
        
    Script.setInterval(function () {
        reset = true;    
    }, RESET_TIME);
    
    function deleteLocalEntities() {
        var allLocalEntities = Overlays.findOverlays(MyAvatar.position,5000);
        for (var n in allLocalEntities) {            
            var localProps = Entities.getEntityProperties(allLocalEntities[n]);            
            if (localProps.name === "bingoCard") {
                Overlays.deleteOverlay(localProps.id);
            }
        }    
    }

    function arrayToString(array) {
        var string = "Numbers Called:" + "\n";
        if (array.length === 0) {
            string = "0";
        }
        if (array.length > 0) {
            for (var j = 0; j < array.length; j++) {
                string = string + array[j] + "-";
                if (j % 10 === 0 && j !== 0) {
                    string = string + "\n";
                }
            }
        }
        return string;
    }

    function onDomainChanged() {
        print("User " + AccountServices.username + " changed domain");
        deleteLocalEntities();
        cardID = "";
    }

    function UserGotDisconnected() {
        print("User " + AccountServices.username + " got Disconnected");
        deleteLocalEntities();        
        cardID = "";
    }


    Window.domainChanged.connect(onDomainChanged);

    AccountServices.disconnected.connect(UserGotDisconnected);
});
