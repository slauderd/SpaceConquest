require("../static/js/planet.js");
require("../static/js/player.js");

var NAME_ARRAY = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
/*global Game*/
/*global Player*/
Game = function (o) {
    this.createdTime = new Date();
    this.players = []; // list of current players
    this.planets = []; // list of current planets
    this.turn = 1; // current game turn
    this.homeWorlds = [];
    this.planetNameIDX = 0;
    
    
    this.options = {
        width : 1000,
        height: 800,
        game_id : 0,
        start_time : "",
        end_time : "",
        running : false,
        planets : 20
    }
    
    this.setOptions(o);
    // // grab any setup options
    // if (o) {
    //     for (var i in this.options) {
    //         this.options[i] = o[i] ? o[i] : this.options[i];
    //     }
    // }
    
    // build out planets for game
    this.generatePlanets(this.options.planets);

 
}

Game.prototype = {
    constructor : Game,
    start : function () {
        // flag game as running
        this.options.running = true;
        this.createGameLoop();
        console.log('starting game at '+this.createdTime);
    },
    getNextName : function() {
        return NAME_ARRAY[this.planetNameIDX++];
    },
    addPlayer : function (o) {
        var player = new Player(o); 
        this.players.push(player);
        return player;
    },
    addPlanet : function (o) {
        var planet = new Planet({name: this.getNextName()});
        planet.setOptions(o);
        this.planets.push(planet);
        return planet;
    },
    clearPlanets : function () {
        this.planetNameIDX = 0;
        this.planets = [];
    },
    sendMessage : function(event, data) {
        this.players.forEach(function (socket) {
            socket.emit(event, data);
        });   
    },
    setOptions : function(o) {
        if (o) {
            for (var i in this.options) {
                this.options[i] = o[i] ? o[i] : this.options[i];
            }
        }    
    },
    printOptions : function() {
        for (var i in this.options) {
            console.log("%s : %s",i,this.options[i]);
        }
    }
}

// create planet list
Game.prototype.generatePlanets = function(num) {
    var red = 1;
    var purple = 1;
    var green = 1;
    
    console.log("Generating %s planets",num);
    for (var i=0; i<num; i++) {
        var planet_sprite = "gray_planet"; // default neutral
        var x,y;
        var test_cnt = 0; // make sure we don't go infinite
        var planetW = 64;
        var planetH = 64;
        
        do {
            test_cnt++;
            x = Math.floor(Math.random() * (this.options.width - 0)) + 50;
            y = Math.floor(Math.random() * (this.options.height - 0)) + 50;
        } while (!this.testPlanetCollide(x,y,64,64) && test_cnt < 200);
        
        // if we didn't exceed our attempts to find a non collision space add it
        if (test_cnt < 200) {
            // map in home worlds that are availale
            if (red) {
                planet_sprite = "red_planet";
                red--;
            } else if(purple) {
                planet_sprite = "purple_planet";
                purple--;
            } else if(green) {
                planet_sprite = "green_planet";
                green--;
            } else {
                planetW = 32;
                planetH = 32;
            }

            // add planet
            var planet = this.addPlanet({sprite: planet_sprite, x: x, y: y, width: planetW, height: planetH });
            // add homeworld if not gray
            if (planet_sprite !== "gray_planet") {
                this.homeWorlds.push(planet);
            }
            
        } else {
            console.log("giving up on planet after tests %s ",test_cnt);
        }
    }
}

// test for planet collission, make sure new x,y is not within 64 pixels of 
// any other planet
Game.prototype.testPlanetCollide = function(testX, testY, testW, testH) {
    //console.log('testing %sx%s',testX, testY);
    var collision = false;
    
    // make sure we're in bounds
    if (testX > this.options.width - 75 || testX < 75) {
        //console.log('outer bounds collission');
        return false;
    }
    if (testY > this.options.height - 75 || testY < 75) {
        //console.log('outer bounds collission');
        return false;
    }

    // loop planets and test to see if we overlap    
    for (var planet in this.planets) {
        var currentX = this.planets[planet].options.x;
        var currentY = this.planets[planet].options.y;
        
        // find center points
        var currentCenterX = (currentX + 32);
        var currentCenterY = (currentY + 32);
        var testCenterX = (testX + 32);
        var testCenterY = (testY + 32);
        
        // calc vector 
        var vx = testCenterX - currentCenterX;
        var vy = testCenterY - currentCenterY;
        
        var combinedHW = 64;
        var combinedHH = 64;
    
        // test for collision
        if (Math.abs(vx) < combinedHW) {
            // we're in collission in the x axis, check y
            if (Math.abs(vy) < combinedHH) {
                // y collission
                collision = true;
            } 
        } 

    }   
    if (collision) {
        return false;
    } else {
        return true;    
    }
}

// create game loop
Game.prototype.createGameLoop = function() {
    var that = this;
    console.log('game loop starting');
    
    setInterval( function turn() {
      //console.log("Num active players: %s",that.players.length);
      // if we have players active, then cycle turns
      if (that.players.length) {
        that.sendMessage("update_turn",that.turn);
        that.turn++;
      }
    },2000);
    
}
