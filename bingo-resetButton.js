(function() {
    var myID;
    var myParentID;
    var reset = false;
    var RESET_TIME = 500;
    var LOCATION_ROOT_URL = Script.resolvePath(".");
    var clickSound = SoundCache.getSound(LOCATION_ROOT_URL + "448086__breviceps__normal-click.wav");     

    this.preload = function (entityID) {
        myID = entityID;
        myParentID = Entities.getEntityProperties(myID,["parentID"]).parentID;        
    };

    function click() {
        var bingoUser = Account.username;
        if (reset) {
            var injectorOptions = {
                position: MyAvatar.position,
                volume: 0.1,
                localOnly: true            
            };
            Audio.playSound(clickSound, injectorOptions);   
            Entities.callEntityServerMethod(                             
                myParentID, 
                "reset",
                [MyAvatar.sessionUUID,MyAvatar.displayName,bingoUser]
            );
            print("reset is Clicked!");
            reset = false;
        }         
    }

    Script.setInterval(function () {
        reset = true;    
    }, RESET_TIME);

    this.startNearTrigger = click;
    this.clickDownOnEntity = click;
    this.startFarTrigger = click;
});
