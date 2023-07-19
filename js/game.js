let game;

const gameOptions = {
    playerGravity: 900,
    playerSpeed: 300,
    platformWidth: 150/2, // nämä jaetaan kahteen koska koordinaatisto objectillo on sen keskipiste
    platformHeight: 20/2,
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
        },
        pixelArt: true,
        physics: {
            default: "arcade",
            arcade: {
                gravity: {
                    y: 0
                }
            }
        },
        scene: PlayGame
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
        this.load.image("sideWall", "assets/sidewall.png")
    }

    create() {
        // background 
        this.add.image(game.config.width/2,game.config.height/2, "background")

        // add the ground group
        this.groundGroup = this.physics.add.group({
            immovable: true,
            allowGravity: false
            
        })
        // add side wall to bounce off from
        this.groundGroup.create(gameOptions.sideWallWidth, game.config.height/2, "sideWall");
        this.groundGroup.create(game.config.width-gameOptions.sideWallWidth*2, game.config.height/2, "sideWall");
        

        // add ground objects to scene
        for(let i = 0; i < 10; i++) {
            this.groundGroup.create(Phaser.Math.Between(gameOptions.platformWidth, game.config.width-gameOptions.platformWidth), 
            Phaser.Math.Between(gameOptions.platformWidth, game.config.height-200), "ground");
        }

        // adding the player and giving its his properties
        this.player = this.physics.add.sprite(game.config.width / 2, game.config.height-100, "player")
        this.player.body.gravity.y = gameOptions.playerGravity
        this.physics.add.collider(this.player, this.groundGroup)
        this.groundGroup.create(this.player.body.x, this.player.body.y+70, "ground");

        // adding the stars
        this.starsGroup = this.physics.add.group({})
        this.physics.add.collider(this.starsGroup, this.groundGroup)

        // if player and stars collide call collectStar
        this.physics.add.overlap(this.player, this.starsGroup, this.collectStar, null, this)

        // UI
        this.add.image(16, 16, "star")
        this.scoreText = this.add.text(32, 3, "0", {fontSize: "30px", fill: "#ffffff"})
        

        // user input?
        this.cursors = this.input.keyboard.createCursorKeys()

        // Animations
        // this.anims.create({
        //     key: "left",
        //     frames: this.anims.generateFrameNumbers("player", {start: 0, end: 3}),
        //     frameRate: 10,
        //     repeat: -1
        // })
        // this.anims.create({
        //     key: "turn",
        //     frames: [{key: "player", frame: 4}],
        //     frameRate: 10,
        // })

        // this.anims.create({
        //     key: "right",
        //     frames: this.anims.generateFrameNumbers("player", {start: 5, end: 9}),
        //     frameRate: 10,
        //     repeat: -1
        // })

        //trigger for adding ground infinetly
        this.triggerTimer = this.time.addEvent({
            // callback: this.addGround,
            callbackScope: this,
            delay: 700,
            loop: true
        })
    }
    // add new stuff and
    addGround() {
        console.log("Adding new stuff!")
        this.groundGroup.create(Phaser.Math.Between(0, game.config.width), 0, "ground")
        this.groundGroup.setVelocityY(gameOptions.playerSpeed / 6) // this moves every ground down

        if(Phaser.Math.Between(0, 1)) {
            this.starsGroup.create(Phaser.Math.Between(0, game.config.width), 0, "star")
            this.starsGroup.setVelocityY(gameOptions.playerSpeed)

        }
    }

    collectStar(player, start) {
        start.disableBody(true, true)
        this.score += 1
        this.scoreText.setText(this.score)
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


        if(this.cursors.space.isDown && this.player.body.touching.down) {
            // vertical velocity
            this.player.body.velocity.y = -gameOptions.playerGravity / 1.6
            
            // horizontal velocity 
            let relativePos = game.input.mousePointer.x-this.player.body.x
            this.player.body.velocity.x = relativePos / 1
            
            // THIS IS JUST STUPID LEGACY CODE :D
            // if (this.player.body.x > game.input.mousePointer.x) {
            //     relativePos = this.player.body.x-game.input.mousePointer.x
            //     this.player.body.velocity.x = -relativePos
            // } else {
            //     relativePos = game.input.mousePointer.x-this.player.body.x
            //     this.player.body.velocity.x = relativePos
            // }

            // DEBUG
            // console.log("mouse x: " + game.input.mousePointer.x)
            // console.log("player x: " + this.player.body.x)
            // console.log("relative x:" + relativePos)
        }

        // game over
        if(this.player.y > game.config.height || this.player.y < 0) {
            this.add.image(game.config.width/2,game.config.height/2,"gameOver")
            this.scene.pause()

            this.scene.start("PlayGame")
        }

    }

}