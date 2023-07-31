let game;

const gameOptions = {
    playerGravity: 900,
    playerSpeed: 300,
    platformWidth: 150/2, // nämä jaetaan kahteen koska koordinaatisto objectillo on sen keskipiste
    platformHeight: 20/2,
    playerWidth: 32/2,
    playerHeight: 42/2,
    starWidth: 30/2,
    starHeight: 30/2,
    sideWallWidth: 5/2
}

window.onload = function() {
    let gameConfig = {
        type: Phaser.AUTO,
        backgroundColor: "#112211",
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,

            width: 800,
            height: 1000,

            max: {
                width: 800,
                height: 1000,
            }
        },
        pixelArt: true,
        physics: {
            default: "arcade",
            arcade: {
                gravity: {
                    y: 0
                },
                debug: true // enable/disable debug mode
            }
        },
        scene: PlayGame,

        input: "enabled"
    }

    game = new Phaser.Game(gameConfig)
    window.focus();
}

class PlayGame extends Phaser.Scene {

    constructor() {
        super("PlayGame")
        this.score = 0;
    }


    preload() {
        this.load.image("ground", "assets/platform1.png")
        this.load.image("star", "assets/star.png")
        // this.load.spritesheet("player", "assets/player.png", {frameWidth: 32, frameHeight: 48})
        this.load.image("player", "assets/player1.png")
        this.load.image("gameOver", "assets/game_Over.png")
        this.load.image("background", "assets/background.png")
        // this.load.image("sideWall", "assets/sidewall.png")
        this.load.audio("boing","assets/boing.mp3")
        this.load.audio("starSound","assets/starSound.mp3")
    }

    create() {
        // background 
        this.add.image(game.config.width/2,game.config.height/2, "background")

        // ground group
        this.groundGroup = this.physics.add.group({
            immovable: true,
            allowGravity: false
            
        })

        // moving ground group
        this.groundGroup = this.physics.add.group({
            immovable: false,
            allowGravity: false
            
        })

        console.log(this.groundGroup)

        // Player and its properties
        this.player = this.physics.add.sprite(game.config.width / 2, game.config.height-100, "player")
        this.player.body.gravity.y = gameOptions.playerGravity
        this.player.body.setBounce(.1);
        this.player.setCollideWorldBounds(true);
        this.physics.add.collider(this.player, this.groundGroup)
        // adding a platform under the player
        this.groundGroup.create(this.player.body.x, this.player.body.y+70, "ground");

        
        // Stars
        this.starsGroup = this.physics.add.group({})
        this.physics.add.collider(this.starsGroup, this.groundGroup)
        // if player and stars collide call collectStar
        this.physics.add.overlap(this.player, this.starsGroup, this.collectStar, null, this)

        // UI
        this.add.image(16, 16, "star")
        this.scoreText = this.add.text(32, 3, "0", {fontSize: "30px", fill: "#ffffff"})
        

        // user input?
        this.cursors = this.input.keyboard.createCursorKeys()

        // Sounds
        this.boing = this.sound.add("boing", {loop: false, volume: .5})
        this.starSound = this.sound.add("starSound", {loop: false, volume: .5})

        // add ground
        this.addGround()


        // trigger for adding ground infinetly
        this.triggerTimer = this.time.addEvent({
            callback: this.moveGround,
            callbackScope: this,
            delay: 10,
            loop: true
        })
    }
    // add ground objects to the scene
    addGround() {
        
        for(let i = 0; i < 9; i++) { // 9 bc height iss 1000 and last 900-100 is for start
            // set x coord inside the window
            let xCoord = Phaser.Math.Between(
            gameOptions.platformWidth, game.config.width-gameOptions.platformWidth)
            
            // set y coord to be between 10 and 100 in 100 intervals
            let yCoord = Phaser.Math.Between(10+(100*i), 100+(100*i))
            
            
            let ground = this.groundGroup.create(xCoord, yCoord+gameOptions.platformHeight*2, "ground");
            
            // 50/50 to add a star onto the platform
            if(Phaser.Math.Between(0, 1)) {
                this.starsGroup.create(xCoord, yCoord, "star")
            }
        }
    }

    // star collecting function
    collectStar(player, star) {
        star.destroy()
        this.score += 100
        this.scoreText.setText(this.score)
        this.starSound.play()
    }

    // function to move selected platforms

    moveGround() {

    }
    
    update() {
        // controls and animations 

        /* FOR DEBUGGING
        if(this.cursors.left.isDown) {
            this.player.body.velocity.x = -gameOptions.playerSpeed
        }
        else if(this.cursors.right.isDown) {
            this.player.body.velocity.x = gameOptions.playerSpeed
        } else {
            this.player.body.velocity.x = 0
        }
        */ 

        // PC controls
        if(this.cursors.space.isDown && this.player.body.touching.down) {
            // vertical velocity
            this.player.body.velocity.y = -gameOptions.playerGravity / 1.4
            
            // horizontal velocity 
            let relativePos = game.input.mousePointer.x-this.player.body.x
            this.player.body.velocity.x = relativePos / 1
            
            this.boing.play()
        }

        // touchpad controls
        this.input.on('pointerup', function(pointer){

            // check if the character is touching the ground
            if (!this.player.body.touching.down) {
                return
            }

            // vertical velocity
            this.player.body.velocity.y = -gameOptions.playerGravity / 1.4
    
            // horizontal velocity 
            let relativePos = pointer.x-this.player.body.x
            this.player.body.velocity.x = relativePos / 1
            
            this.boing.play()
        }, this);

        // debug logging
        if (this.cursors.down.isDown) {
            console.log("player y: " + this.player.y)
            console.log("body y: " + this.player.body.y)
            console.log(this.player.getBottomCenter().y)
            console.log("alpha: " + this.player.alpha)

            console.log(game.config)
        }


        // game over
        if(this.player.getBottomCenter().y >= game.config.height) {
            this.add.image(game.config.width/2,game.config.height/2,"gameOver")
            this.player.destroy()
            this.input.on('pointerup', function(pointer){
                this.scene.destroy()
                this.scene.start("PlayGame")
            }, this)
        }

        // next stage
        if (this.player.getTopCenter().y < 0) {
            this.scene.start("PlayGame")
        }

    }

}