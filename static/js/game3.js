window.onload = function(){
    var width = 320;
    var height = 480;    
    var menu = function(game){
        this.speed = null;
        this.count = null;
        this.text = null;
        this.instruct = null;

    }; 
    menu.prototype = {
        preload: function(){            
            game.load.image('title', 'img/pixum2.png');
            game.load.image('click', 'img/click2.png');            
            game.stage.backgroundColor = "2EE1E1";
        },
        create: function(){
            this.speed = 3;
            this.count = 5;
            this.title = game.add.sprite(width/2,height/4,'title');
            this.title.anchor.setTo(0.5,0.5);
            this.click = game.add.sprite(this.title.x,this.title.y+100,'click');
            this.click.anchor.setTo(0.5,0.5);
            this.click.scale.set(0.7,0.7);
            this.text = game.add.text(this.title.x,this.title.y+150," to Begin!",{
                fill: "#123123",
                font:"bold 30px Arial"
            });
            this.instruct = game.add.text(10,this.title.y+250,"Spacebar or up key to jump",{
                fill: "#125",
                font:"bold 15px Arial"
            });
            game.input.onDown.addOnce(this.changeState,this);
        },
        update: function(){
            if(this.count == 0){
                this.speed = 0;
            }
            if(this.title.x > width-this.title.width){
                this.speed = -3;
                this.count-=1;
            }

            if(this.title.x < 100){
                this.speed = 3;
                this.count-=1;
            }
            this.title.x += this.speed;
            this.click.x = this.title.x;
            this.click.y = this.title.y+100;
        },
        changeState: function(){
            game.state.start('game');
        }
    
    }
    var play = function(game){
        this.bird;
        this.birdGravity = 800;
        this.birdSpeed = 125;
        this.birdFlapPower = 300;
        this.pipeInterval = 200;
        this.reductionInterval = 1300;   
        this.pipe;
        this.pipeGroup;
        this.score = 0;
        this.scoreText;
        this.topScore;
        this.pipebmd;

        this.health;
        this.healthGroup;
        this.healthInterval = 3000;

        this.spaceKey;
        this.playerSize = 32;
        this.enemySize = 12;
        this.rectSize = 10;
        this.scale = 1;
        this.cursors;
        var that = this;    
    };    
    play.prototype = {
        create:function(){
            that = this;
            this.scale = 1;          
            this.score = 0;            
            this.topScore = localStorage.getItem("topScore")==null?0:localStorage.getItem("topScore");
            
            this.scoreText = game.add.text(10,10,"-",{
                fill: "#eeeeee",
                font:"bold 16px Arial"
            });
            
            this.updateScore();
            game.stage.backgroundColor = "222";
            //if the browser tab loses focus game will not pause
            game.stage.disableVisibilityChange = true;
            game.physics.startSystem(Phaser.Physics.ARCADE);
            //bitmapdata if doing without sprite
            this.birdbmd = game.add.bitmapData(this.playerSize,this.playerSize);
            this.birdbmd.ctx.rect(0,0,this.playerSize,this.playerSize);
            this.birdbmd.ctx.fillStyle = "#fff";
            this.birdbmd.ctx.fill();
            
            this.pipebmd = game.add.bitmapData(this.enemySize,this.enemySize);
            this.pipebmd.ctx.rect(0,0,this.enemySize,this.enemySize);
            this.pipebmd.ctx.fillStyle = "#333";
            this.pipebmd.ctx.fill();
            
            this.healthbmd = game.add.bitmapData(this.rectSize,this.rectSize*2);
            this.healthbmd.ctx.rect(0,0,this.rectSize,this.rectSize*2);
            this.healthbmd.ctx.fillStyle = "#ffd700";
            this.healthbmd.ctx.fill();

            //this.health = game.add.sprite(80,240,this.birdbmd);

            this.bird = game.add.sprite(80,240,this.birdbmd);
            this.bird.anchor.set(0.5);
            game.physics.arcade.enable(this.bird);            

            this.pipeGroup = game.add.group();
            this.healthGroup = game.add.group();

            game.physics.arcade.enable(this.pipeGroup);
            game.physics.arcade.enable(this.healthGroup);

            this.pipeGroup.enableBody = true;
            this.healthGroup.enableBody = true;

            this.bird.body.gravity.y = this.birdGravity;
            this.spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
            this.spaceKey.onDown.add(this.flap, this);            
            game.time.events.loop(this.pipeInterval, this.addPipe, this);
            game.time.events.loop(this.reductionInterval, this.helpBird, this);
            game.time.events.loop(this.healthInterval, this.addHealth, this);

            this.cursors = game.input.keyboard.createCursorKeys();
            this.cursors.up.onDown.add(this.flap,this);  
            game.input.onDown.add(this.flap,this);         
            this.addPipe();
        },
        update:function(){        
            game.physics.arcade.overlap(this.bird, this.pipeGroup, this.bigger,null,this);
            game.physics.arcade.overlap(this.bird, this.healthGroup, this.healthier,null,this);         
            if(this.bird.y > game.height || this.bird.y <= 0){
                this.die();
            }

        },
        helpBird: function(){      
            this.score+=0.5;
            this.updateScore();            
            if(that.bird.body.gravity.y == 800){
                return;
            }        
            this.bird.body.gravity.y -= 50;
            if(this.scale > 1){
                this.scale -= 0.3;
            }            
            this.bird.scale.set(this.scale,this.scale);        
        },

        updateScore: function(){    
            this.scoreText.text = "Score: "+this.score+"\nBest: "+this.topScore;    
        },

        flap: function(){
            this.bird.body.velocity.y = -this.birdFlapPower;
        },
    
        // would be pixel create for pixjum
        addPipe: function(){            
            var randomY = game.rnd.between(50,480);
            var randomColor = this.getRandomColor();
            var tempbmd = this.pipebmd;
            tempbmd.ctx.fillStyle = randomColor;
            tempbmd.ctx.fill();
            this.pipe = this.pipeGroup.create(game.width - this.enemySize,randomY,tempbmd);        
            this.pipe.body.velocity.x = -this.birdSpeed;     
        },

        addHealth: function(){            
            var randomY = game.rnd.between(50,480);
            this.health = this.healthGroup.create(game.width - this.rectSize, randomY, this.healthbmd);        
            this.health.body.velocity.x = -this.birdSpeed;
        },

        getRandomColor: function(){
            var toSelectFrom = [1,2,3,4,5,6,7,8,9,'A','B','C','D','E'];
            var random = "#";
            var temp;
            for(var i = 0; i<6;i++){
                temp = game.rnd.between(0,toSelectFrom.length);
                random+=toSelectFrom[temp];
            }
            return random;
        },

        bigger:function(bird, enemy){            
            this.scale+=0.3;
            this.bird.scale.set(this.scale,this.scale);
            this.score -= 0.5;
            this.bird.body.gravity.y += 50;
            enemy.kill();
            this.updateScore();
        },
        healthier:function(bird, healthbar){            
            this.score += 5;
            if(this.scale > 1){
                this.scale -= 0.3;
            }            
            this.bird.scale.set(this.scale,this.scale);                        
            healthbar.kill();
            this.updateScore();
        },
        die: function(){
            localStorage.setItem("topScore",Math.max(this.score,this.topScore));
            game.state.start("gameover");
    
           
        },
    }
    var gameover = function(game){
        this.speed = null;
        this.count = null;
        this.text = null;

    }; 
    gameover.prototype = {
        preload: function(){            
            game.load.image('title', 'img/pixum2.png');
            game.load.image('click', 'img/click2.png');
            game.stage.backgroundColor = "2EE1E1";
        },
        create: function(){
            this.speed = 3;
            this.count = 5;
            this.title = game.add.sprite(width/2,height/4,'title');
            this.title.anchor.setTo(0.5,0.5);
            this.click = game.add.sprite(this.title.x,this.title.y+100,'click');
            this.click.anchor.setTo(0.5,0.5);
            this.click.scale.set(0.7,0.7);
            this.text = game.add.text(this.title.x,this.title.y+150," to Restart!",{
                fill: "#123123",
                font:"bold 30px Arial"
            });
            game.input.onDown.addOnce(this.changeState,this);
        },
        update: function(){
            if(this.count == 0){
                this.speed = 0;
            }
            if(this.title.x > width-this.title.width){
                this.speed = -3;
                this.count-=1;
            }

            if(this.title.x < 100){
                this.speed = 3;
                this.count-=1;
            }
            this.title.x += this.speed;
            //this.text.x = this.title.x-100;
            //this.text.y = this.title.y+100;
            this.click.x = this.title.x;
            this.click.y = this.title.y+100;
        },
        changeState: function(){
            game.state.start('game');
        }
    
    }
    var game = new Phaser.Game(width,height, Phaser.AUTO,'myGame');
    game.state.add('menu',menu);
    game.state.add('game',play);
    game.state.add('gameover',gameover
        );
    game.state.start('menu');
}