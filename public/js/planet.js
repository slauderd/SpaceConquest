
Planet = function (o) {
    this.createTime = new Date();
    this.sprite;

    this.options = {
        name: "",
        x: 0,
        y: 0,
        width: 64,
        height: 64,
        offense: 0,
        defense: 0,
        ships: 0,
        player: 0,
        sprite: "gray_planet"
    }
    
    this.planetInfo = {
        label: undefined // text reference
    }
    
    // grab any setup options
    this.setOptions(o);
    

    //console.log("creating planet");
}

Planet.prototype = {
    constructor : Planet,
    setOptions : function(o) {
        if (o) {
            for (var i in this.options) {
                this.options[i] = o[i] ? o[i] : this.options[i];
            } 
        }    
    },
    destructor: function() {
        // clean up planet ctx objects
        this.planetInfo.label.destroy();
        this.sprite.kill();
        
    }
}

Planet.prototype.selectPlanet = function () {
    console.log("Clicked %s",this.options.name);
    
    if (selected_planet.planet !== this.options.name) {
        this.deselectPlanet();
    }
    
    var x = this.options.x + (this.options.width / 2);
    var y = this.options.y + (this.options.height / 2);
    
    console.log("%s %s",this.options.width,this.options.height);
    
    // draw selection circle
    var circle = new Phaser.Circle(x,y, this.options.width);
    var gfx = game.add.graphics(0,0);
    gfx.lineStyle(1,0x00ff00,1);
    
    // store selection
    selected_planet.planet = this.options.name;
    selected_planet.ref = gfx.drawCircle(circle.x,circle.y,circle.diameter);
}

Planet.prototype.deselectPlanet = function () {
    if (selected_planet.ref) {
        selected_planet.ref.kill();    
    }
    
    selected_planet = {planet: undefined,ref: undefined};
}

Planet.prototype.render = function() {
    var x = this.options.x;
    var y = this.options.y;
    var sprite = this.options.sprite;


    // render planet info items
    this.renderPlanetInfo();
    
    // add the sprite and store ref
    this.sprite = game.add.sprite(x,y,sprite);
    
    // turn on event handling 
    this.sprite.inputEnabled = true;
    this.sprite.events.onInputDown.add(function(el) {
        this.selectPlanet(game);
    },this);

}

Planet.prototype.renderPlanetInfo = function() {
    var x = this.options.x - 10;
    var y = this.options.y - 10;
    var width = this.options.width;
    var height = this.options.height;
    var planet_label;

    //console.log("%s %s %s %s",x,y,width,height);
    
    
    // display name
    var t = game.add.text(x, y, this.options.name, { 
                                                        font: "12px Arial Black", 
                                                        fill: "#000000" 
                                                     });
    t.stroke = "#ffffff";
    t.strokeThickness = 2;
    this.planetInfo.label = t;

    
}