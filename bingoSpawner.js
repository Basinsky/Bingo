var localRot;
var LOCATION_ROOT_URL = Script.resolvePath(".");
var TIME_OUT_MS = 1000;

var nummerID = Entities.addEntity({
    type: "Model",        
    name: "BingoMain",
    modelURL: LOCATION_ROOT_URL + "BingoNew.glb?"+ Date.now(),
    script: LOCATION_ROOT_URL + "bingo-Client.js?" + Date.now(),
    serverScripts: LOCATION_ROOT_URL + "bingo-Server.js?" + Date.now(),       
    position: Vec3.sum(MyAvatar.position, Vec3.multiplyQbyV(MyAvatar.orientation, { x: 0, y: 3, z: -5 })), // { x: 0, y: 1, z: -5 }
    dimensions: { x: 10, y: 8, z: 0.3 },   
    rotation: MyAvatar.orientation,     
    lifetime: -1,            
    userData: JSON.stringify({
        grabbableKey: { grabbable: false, triggerable: false }
    })                          
});
Script.stop();

