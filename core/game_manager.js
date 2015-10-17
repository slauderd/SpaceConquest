require("../core/game.js");

GameManager = function () {
    this.createdTime = new Date();
    this.gameList = [];
    
}    
    
GameManager.prototype = {
    constructor : GameManager,
    start : function () {
        console.log('starting game manager at '+this.createdTime);
    },
    createGame : function (o) {
        // create a new game object
        var game = new Game(o);
        // store in reference array
        this.gameList.push(game);
        
        // start the game
        game.start();
        
        // return the game
        return game;
    }
    
}
    
    
