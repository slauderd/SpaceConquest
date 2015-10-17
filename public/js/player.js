/*global Player */
Player = function (o) {
    this.createdTime = new Date();
    this.ctx = false; 
    this.socket = false;
    
    this.options = { 
        playerName : 0,
        alive : true
    }
    
    // grab any setup options
    if (o) {
        for (var i in this.options) {
            this.options[i] = o[i] ? o[i] : this.options[i];
        }
    }
    
    console.log("player created: "+this.options.playerName);

}

Player.prototype = {
    constructor : Player,
    setCTX : function (ctx) {
        console.log("received a context");
        this.ctx = ctx;
    },
    setSocket : function (socket) {
        console.log("setting player socket reference");
        this.socket = socket;
    }
}