import { Animations, GameObjects, Tilemaps, Types } from 'phaser';
import { Align } from '../util/align';
import { BIRDWING_BUTTERFLY_NAME, CATCHING_DISTANCE, DEFAULT_BUTTERFLY_SCALE, DEFAULT_BUTTERFLY_SPRITE_FRAMERATE, DEFAULT_CATCH_SPRITE_FRAMERATE, DEFAULT_EFFECT_FRAMERATE, DEFAULT_IDLE_SPRITE_FRAMERATE, DEFAULT_SPRITE_SCALE, DEFAULT_WALK_SPRITE_FRAMERATE, HAIRSTREAK_BUTTERFLY_NAME, LUNAMOTH_BUTTERFLY_NAME, PERIANDER_BUTTERFLY_NAME, TILE_SCALE, TILE_SIZE } from '../util/const';
import { BaseScene } from './BaseScene';
import AnimatedTilesPlugin from '../plugins/animated_tiles/animated_tiles';

export class Game extends BaseScene
{
    camera: Phaser.Cameras.Scene2D.Camera;

    megan: Types.Physics.Arcade.SpriteWithDynamicBody;    
    meganDirection: string = 'down';
    playerVelocity: number = 256;
    meganCatchSprite: Types.Physics.Arcade.SpriteWithDynamicBody;

    isCatching: boolean = false;

    cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;

    birdwingButterfly: Types.Physics.Arcade.SpriteWithDynamicBody;
    hairstreakButterfly: Types.Physics.Arcade.SpriteWithDynamicBody;
    lunaMothButterfly: Types.Physics.Arcade.SpriteWithDynamicBody;
    perianderMetalmarkButterfly: Types.Physics.Arcade.SpriteWithDynamicBody;
    butterflies: Types.Physics.Arcade.SpriteWithDynamicBody[] = [];

    birdwingButterflyIcon: GameObjects.Sprite;
    hairstreakButterflyIcon: GameObjects.Sprite;
    lunaMothButterflyIcon: GameObjects.Sprite;
    perianderMetalmarkButterflyIcon: GameObjects.Sprite;

    isTouchUpDown: boolean = false;
    isTouchLeftDown: boolean = false;
    isTouchRightDown: boolean = false;
    isTouchDownDown: boolean = false;

    isUpDown: boolean = false;
    isLeftDown: boolean = false;
    isRightDown: boolean = false;
    isDownDown: boolean = false;

    isPreviousUpDown: boolean = false;
    isPreviousLeftDown: boolean = false;
    isPreviousRightDown: boolean = false;
    isPreviousDownDown: boolean = false;

    interactKey: Phaser.Input.Keyboard.Key | undefined;

    isInteractKeyDown: boolean = false;
    isPreviousInteractKeyDown: boolean = false;

    playerTouching: boolean = false;
    wasPlayerTouching: boolean = false;

    isUpdating: boolean = true;

    map: Tilemaps.Tilemap;
    grassSpringTileset: Tilemaps.Tileset;
    grassWaterSpringTileset: Tilemaps.Tileset;
    waterFountainTileset: Tilemaps.Tileset;
    birchTreeTileset: Tilemaps.Tileset;
    housesTileset: Tilemaps.Tileset;
    housingDecorationsTileset: Tilemaps.Tileset;

    collidersLayer: Tilemaps.TilemapLayer;
    above1Layer: Tilemaps.TilemapLayer;
    above2Layer: Tilemaps.TilemapLayer;
    above3Layer: Tilemaps.TilemapLayer;
    above4Layer: Tilemaps.TilemapLayer;
    above5Layer: Tilemaps.TilemapLayer;
    before1Layer: Tilemaps.TilemapLayer;
    before2Layer: Tilemaps.TilemapLayer;
    before3Layer: Tilemaps.TilemapLayer;

    tilesets: Tilemaps.Tileset[] = [];

    xLimit: number = 0;
    yLimit: number = 0;
    tilemapScale: number = 0;

    sparkleSprite: GameObjects.Sprite;

    public animatedTiles!: AnimatedTilesPlugin; 

    constructor ()
    {
        super('Game');
    }

    preload()
    {
        this.load.spritesheet('transparent', 'assets/transparent.png', {frameWidth: 8, frameHeight: 8});
        this.load.spritesheet('megan_idle', 'assets/megan/Megan-Idle.png', {frameWidth: 32, frameHeight: 32});
        this.load.spritesheet('megan_walk', 'assets/megan/Megan-Walk.png', {frameWidth: 32, frameHeight: 32});
        this.load.spritesheet('megan_catching', 'assets/megan/Megan-Catching.png', {frameWidth: 32, frameHeight: 32});

        this.load.spritesheet('birdwing_butterfly_icon', 'assets/sprites/butterflies/icons/Birdwing Butterfly.png', {frameWidth: 16, frameHeight: 16});
        this.load.spritesheet('hairstreak_butterfly_icon', 'assets/sprites/butterflies/icons/Hairstreak Butterfly.png', {frameWidth: 16, frameHeight: 16});
        this.load.spritesheet('lunamoth_butterfly_icon', 'assets/sprites/butterflies/icons/Luna Moth.png', {frameWidth: 16, frameHeight: 16});
        this.load.spritesheet('periander_metalmark_butterfly_icon', 'assets/sprites/butterflies/icons/Periander Metalmark.png', {frameWidth: 16, frameHeight: 16});

        this.load.spritesheet('birdwing_butterfly', 'assets/sprites/butterflies/Birdwing Butterfly.png', {frameWidth: 16, frameHeight: 16});
        this.load.spritesheet('hairstreak_butterfly', 'assets/sprites/butterflies/Hairstreak Butterfly.png', {frameWidth: 16, frameHeight: 16});
        this.load.spritesheet('lunamoth_butterfly', 'assets/sprites/butterflies/Luna Moth.png', {frameWidth: 16, frameHeight: 16});
        this.load.spritesheet('periander_metalmark_butterfly', 'assets/sprites/butterflies/Periander Metalmark.png', {frameWidth: 16, frameHeight: 16});

        this.load.spritesheet('sparkles', 'assets/sprites/effects/ice_sparkles.png', {frameWidth: 48, frameHeight: 32});

        this.load.image('grass_spring_tileset', 'assets/tilesets/Grass Spring Extruded.png');
        this.load.image('grass_water_spring_tileset', 'assets/tilesets/Grass Water Spring Extruded.png');
        this.load.image('water_fountain_tileset', 'assets/tilesets/Water fountain extruded.png');

        this.load.image('birch_tree_tileset', 'assets/tilesets/Birch Tree Extruded.png');

        this.load.image('houses_tileset', 'assets/tilesets/Houses Extruded.png');
        this.load.image('house_decorations_tileset', 'assets/tilesets/House Decorations Extruded.png');

        this.load.tilemapTiledJSON('main', 'assets/maps/main.tmj')
    }

    create ()
    {
        super.create();

        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x000000);

        this.configureSceneEvents();
        this.configureTilemaps();
        this.configurePlayer();
        this.configureEffects();
        this.configureAnimationEvents();
        this.configureForegroundTilemaps();
        this.configureInput();
        this.configureButterflies();
        this.configureUI();

        this.animatedTiles.init(this.map);
        this.animatedTiles.setRate(0.5);
    }

    configureSceneEvents() 
    {

    } 

    configurePlayer()
    {
        this.megan = this.physics.add.sprite(100, 100, 'megan', 0).setOrigin(0, 0).setGravity(0, 0);
        Align.scaleToGameWidth( this.megan, DEFAULT_SPRITE_SCALE * 1.5, this);

        this.anims.create({
            key: 'megan_idle_down',
            frames: this.anims.generateFrameNumbers('megan_idle', {start: 0, end: 3}),
            frameRate: DEFAULT_IDLE_SPRITE_FRAMERATE,
            repeat: -1
        });

        this.anims.create({
            key: 'megan_idle_up',
            frames: this.anims.generateFrameNumbers('megan_idle', {start: 4, end: 7}),
            frameRate: DEFAULT_IDLE_SPRITE_FRAMERATE,
            repeat: -1
        });

        this.anims.create({
            key: 'megan_idle_right',
            frames: this.anims.generateFrameNumbers('megan_idle', {start: 8, end: 11}),
            frameRate: DEFAULT_IDLE_SPRITE_FRAMERATE,
            repeat: -1
        });

        this.anims.create({
            key: 'megan_idle_left',
            frames: this.anims.generateFrameNumbers('megan_idle', {start: 12, end: 15}),
            frameRate: DEFAULT_IDLE_SPRITE_FRAMERATE,
            repeat: -1
        });

        this.anims.create({
            key: 'megan_walk_down',
            frames: this.anims.generateFrameNumbers('megan_walk', {start: 0, end: 5}),
            frameRate: DEFAULT_WALK_SPRITE_FRAMERATE,
            repeat: -1
        });

        this.anims.create({
            key: 'megan_walk_up',
            frames: this.anims.generateFrameNumbers('megan_walk', {start: 6, end: 11}),
            frameRate: DEFAULT_WALK_SPRITE_FRAMERATE,
            repeat: -1
        });

        this.anims.create({
            key: 'megan_walk_right',
            frames: this.anims.generateFrameNumbers('megan_walk', {start: 12, end: 17}),
            frameRate: DEFAULT_WALK_SPRITE_FRAMERATE,
            repeat: -1
        });

        this.anims.create({
            key: 'megan_walk_left',
            frames: this.anims.generateFrameNumbers('megan_walk', {start: 18, end: 23}),
            frameRate: DEFAULT_WALK_SPRITE_FRAMERATE,
            repeat: -1
        });

        this.anims.create({
            key: 'megan_catching_down',
            frames: this.anims.generateFrameNumbers('megan_catching', {start: 0, end: 5}),
            frameRate: DEFAULT_CATCH_SPRITE_FRAMERATE,
            repeat: 0
        });

        this.anims.create({
            key: 'megan_catching_up',
            frames: this.anims.generateFrameNumbers('megan_catching', {start: 6, end: 11}),
            frameRate: DEFAULT_CATCH_SPRITE_FRAMERATE,
            repeat: 0
        });

        this.anims.create({
            key: 'megan_catching_right',
            frames: this.anims.generateFrameNumbers('megan_catching', {start: 12, end: 17}),
            frameRate: DEFAULT_CATCH_SPRITE_FRAMERATE,
            repeat: 0
        });

        this.anims.create({
            key: 'megan_catching_left',
            frames: this.anims.generateFrameNumbers('megan_catching', {start: 18, end: 23}),
            frameRate: DEFAULT_CATCH_SPRITE_FRAMERATE,
            repeat: 0
        });
        
        this.megan.play('megan_idle_' + this.meganDirection);

        this.camera.startFollow(this.megan, true, 1.0, 1.0, 0.0, 0.0);
        this.camera.setBounds(0, 0, this.xLimit, this.yLimit);

        this.meganCatchSprite = this.physics.add.sprite(0, 0, 'transparent', 0).setName('catch_sprite');
        Align.scaleToGameWidth(this.meganCatchSprite, 0.08, this);
    }

    configureEffects()
    {
        this.sparkleSprite = this.add.sprite(100, 100, 'sparkles', 0).setVisible(false);
        Align.scaleToGameWidth(this.sparkleSprite, 0.10, this);

        this.anims.create({
            key: 'sparkle_effect',
            frames: this.anims.generateFrameNumbers('sparkles', {start: 0, end: 9}),
            frameRate: DEFAULT_EFFECT_FRAMERATE,
            repeat: 0
        });
    }

    configureAnimationEvents()
    {
        this.sparkleSprite.on(Animations.Events.ANIMATION_COMPLETE, () =>
        {
            this.sparkleSprite.setVisible(false);
        });

        this.megan.on(Animations.Events.ANIMATION_COMPLETE, (animation: Animations.Animation) =>
        {
            if(animation.key.startsWith('megan_catching'))
            {
                this.isCatching = false;
            }
        });

        this.megan.on(Animations.Events.ANIMATION_UPDATE, (animation: Animations.Animation, frame: Animations.AnimationFrame) =>
        {
            if(animation.key.startsWith('megan_catching') && frame.index == 4)
            {
                switch(this.meganDirection)
                {
                    case 'down':
                        this.meganCatchSprite.x = this.megan.x + this.megan.displayWidth / 2;
                        this.meganCatchSprite.y = this.megan.y + this.megan.displayHeight;
                        break;
                    case 'up':
                        this.meganCatchSprite.x = this.megan.x + this.megan.displayWidth / 2;
                        this.meganCatchSprite.y = this.megan.y;
                        break;
                    case 'left':
                        this.meganCatchSprite.x = this.megan.x;
                        this.meganCatchSprite.y = this.megan.y + this.megan.displayHeight / 2;
                        break;
                    case 'right':
                        this.meganCatchSprite.x = this.megan.x + this.megan.displayWidth;
                        this.meganCatchSprite.y = this.megan.y + this.megan.displayHeight / 2;
                        break;
                }

                this.meganCatchSprite.refreshBody();

                if(this.meganCatchSprite)
                {
                    this.physics.overlap(this.meganCatchSprite, this.butterflies, 
                    (_: any, b: any) => 
                    {
                        if(b == this.birdwingButterfly)
                        {
                            this.birdwingButterflyIcon.setFrame(0);
                            b.destroy();
                        }
                        else if (b == this.hairstreakButterfly)
                        {
                            this.hairstreakButterflyIcon.setFrame(0);
                            b.destroy();
                        }
                        else if(b == this.lunaMothButterfly)
                        {
                            this.lunaMothButterflyIcon.setFrame(0);
                            b.destroy();
                        }
                        else if(b == this.perianderMetalmarkButterfly)
                        {
                            this.perianderMetalmarkButterflyIcon.setFrame(0);
                            b.destroy();
                        }

                        this.sparkleSprite.x = b.x;
                        this.sparkleSprite.y = b.y;

                        this.sparkleSprite.setVisible(true);
                        this.sparkleSprite.play('sparkle_effect');
                    });
                }
            }
        });
    }

    configureInput()
    {
        this.isTouchUpDown = false;
        this.isTouchLeftDown = false;
        this.isTouchRightDown = false;
        this.isTouchDownDown = false;
    
        this.isUpDown = false;
        this.isLeftDown = false;
        this.isRightDown = false;
        this.isDownDown = false;
    
        this.isPreviousUpDown = false;
        this.isPreviousLeftDown = false;
        this.isPreviousRightDown = false;
        this.isPreviousDownDown = false;

        this.isInteractKeyDown = false;
        this.isPreviousInteractKeyDown = false;

        this.cursors = this.input.keyboard?.createCursorKeys();
        this.interactKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    }

    private configureTilemaps() 
    {
        this.tilemapScale = (this.getGameWidth() * TILE_SCALE) / TILE_SIZE;

        this.map = this.make.tilemap({key: 'main'});

        this.grassSpringTileset = this.map.addTilesetImage('Grass Spring Extruded', 'grass_spring_tileset', 16, 16, 1, 2)!;
        this.grassWaterSpringTileset = this.map.addTilesetImage('Grass Water Spring Extruded', 'grass_water_spring_tileset', 16, 16, 1, 2)!;
        this.waterFountainTileset = this.map.addTilesetImage('Water fountain extruded', 'water_fountain_tileset', 16, 16, 1, 2)!;
        this.birchTreeTileset = this.map.addTilesetImage('Birch Tree Extruded', 'birch_tree_tileset', 16, 16, 1, 2)!;
        this.housesTileset = this.map.addTilesetImage('Houses Extruded', 'houses_tileset', 16, 16, 1, 2)!;

        this.housingDecorationsTileset = this.map.addTilesetImage('House Decorations Extruded', 'house_decorations_tileset', 16, 16, 1, 2)!;
        this.housingDecorationsTileset.tileOffset = new Phaser.Math.Vector2(0, this.housingDecorationsTileset.tileOffset.y * -this.tilemapScale);

        this.tilesets = 
        [
            this.grassSpringTileset,
            this.grassWaterSpringTileset,
            this.waterFountainTileset,
            this.birchTreeTileset,
            this.housesTileset,
            this.housingDecorationsTileset
        ];

        let backgroundLayer = this.map.createLayer('ground', this.tilesets, 0, 0);   
        let backgroundLayerDecoration = this.map.createLayer('ground_decoration', this.tilesets, 0, 0);
        
        backgroundLayer?.setScale(this.tilemapScale, this.tilemapScale);
        backgroundLayerDecoration?.setScale(this.tilemapScale, this.tilemapScale);

        this.collidersLayer = this.map.createLayer('colliders', this.tilesets)!;
        this.before1Layer = this.map.createLayer('before_1', this.tilesets)!;
        this.before2Layer = this.map.createLayer('before_2', this.tilesets)!;
        this.before3Layer = this.map.createLayer('before_3', this.tilesets)!;
        
        this.collidersLayer.setScale(this.tilemapScale, this.tilemapScale);
        this.before1Layer.setScale(this.tilemapScale, this.tilemapScale);
        this.before2Layer.setScale(this.tilemapScale, this.tilemapScale);
        this.before3Layer.setScale(this.tilemapScale, this.tilemapScale);        

        this.xLimit = this.map.widthInPixels * this.tilemapScale;
        this.yLimit = this.map.heightInPixels * this.tilemapScale;        
    }

    //call after configuring the player
    private configureForegroundTilemaps()
    {
        this.above1Layer = this.map.createLayer('above_1', this.tilesets)!;
        this.above2Layer = this.map.createLayer('above_2', this.tilesets)!;
        this.above3Layer = this.map.createLayer('above_3', this.tilesets)!;
        this.above4Layer = this.map.createLayer('above_4', this.tilesets)!;
        this.above5Layer = this.map.createLayer('above_5', this.tilesets)!;
        
        this.above1Layer.setScale(this.tilemapScale, this.tilemapScale);
        this.above2Layer.setScale(this.tilemapScale, this.tilemapScale);
        this.above3Layer.setScale(this.tilemapScale, this.tilemapScale);
        this.above4Layer.setScale(this.tilemapScale, this.tilemapScale);
        this.above5Layer.setScale(this.tilemapScale, this.tilemapScale);

        this.physics.add.collider(this.megan, this.collidersLayer);
        this.collidersLayer.setCollisionByExclusion([-1], true);
    }

    configureButterflies()
    {
        let butterflyObjects = this.map.getObjectLayer('map_butterflies')!.objects;

        for(const butterfly of butterflyObjects)
        {
            const {x, y} = butterfly;

            switch(butterfly.properties[0].value)
            {
                case 'birdwing':
                    this.birdwingButterfly = this.physics.add.sprite(x! * this.tilemapScale, y! * this.tilemapScale, 'birdwing_butterfly', 0).setName(BIRDWING_BUTTERFLY_NAME);
                    Align.scaleToGameWidth( this.birdwingButterfly, DEFAULT_BUTTERFLY_SCALE, this);

                    this.anims.create({
                        key: 'birdwing_butterfly_flap',
                        frames: this.anims.generateFrameNumbers('birdwing_butterfly', {start: 0, end: 6}),
                        frameRate: DEFAULT_BUTTERFLY_SPRITE_FRAMERATE,
                        repeat: -1
                    });

                    this.birdwingButterfly.play('birdwing_butterfly_flap');

                    this.butterflies.push(this.birdwingButterfly);
                    break;
                case 'hairstreak':
                    this.hairstreakButterfly = this.physics.add.sprite(x! * this.tilemapScale, y! * this.tilemapScale, 'hairstreak_butterfly', 0).setName(HAIRSTREAK_BUTTERFLY_NAME);
                    Align.scaleToGameWidth( this.hairstreakButterfly, DEFAULT_BUTTERFLY_SCALE, this);

                    this.anims.create({
                        key: 'hairstreak_butterfly_flap',
                        frames: this.anims.generateFrameNumbers('hairstreak_butterfly', {start: 0, end: 6}),
                        frameRate: DEFAULT_BUTTERFLY_SPRITE_FRAMERATE,
                        repeat: -1
                    });

                    this.hairstreakButterfly.play('hairstreak_butterfly_flap');

                    this.butterflies.push(this.hairstreakButterfly);
                    break;
                case 'lunamoth':
                    this.lunaMothButterfly = this.physics.add.sprite(x! * this.tilemapScale, y! * this.tilemapScale, 'lunamoth_butterfly', 0).setName(LUNAMOTH_BUTTERFLY_NAME);
                    Align.scaleToGameWidth( this.lunaMothButterfly, DEFAULT_BUTTERFLY_SCALE, this);

                    this.anims.create({
                        key: 'lunamoth_butterfly_flap',
                        frames: this.anims.generateFrameNumbers('lunamoth_butterfly', {start: 0, end: 6}),
                        frameRate: DEFAULT_BUTTERFLY_SPRITE_FRAMERATE,
                        repeat: -1
                    });

                    this.lunaMothButterfly.play('lunamoth_butterfly_flap');

                    this.butterflies.push(this.lunaMothButterfly);
                    break;
                case 'periander':
                    this.perianderMetalmarkButterfly = this.physics.add.sprite(x! * this.tilemapScale, y! * this.tilemapScale, 'periander_metalmark_butterfly', 0).setName(PERIANDER_BUTTERFLY_NAME);
                    Align.scaleToGameWidth( this.perianderMetalmarkButterfly, DEFAULT_BUTTERFLY_SCALE, this);

                    this.anims.create({
                        key: 'periander_butterfly_flap',
                        frames: this.anims.generateFrameNumbers('periander_metalmark_butterfly', {start: 0, end: 6}),
                        frameRate: DEFAULT_BUTTERFLY_SPRITE_FRAMERATE,
                        repeat: -1
                    });

                    this.perianderMetalmarkButterfly.play('periander_butterfly_flap');

                    this.butterflies.push(this.perianderMetalmarkButterfly);
                    break;
            }
        }
    }
    
    configureUI() 
    {
        this.birdwingButterflyIcon = this.add.sprite(0, 0, 'birdwing_butterfly_icon', 3).setScrollFactor(0);
        this.hairstreakButterflyIcon = this.add.sprite(0, 0, 'hairstreak_butterfly_icon', 3).setScrollFactor(0);
        this.lunaMothButterflyIcon = this.add.sprite(0, 0, 'lunamoth_butterfly_icon', 3).setScrollFactor(0);
        this.perianderMetalmarkButterflyIcon = this.add.sprite(0, 0, 'periander_metalmark_butterfly_icon', 3).setScrollFactor(0);

        Align.scaleObjectsToGameWidth([this.birdwingButterflyIcon, this.hairstreakButterflyIcon, this.lunaMothButterflyIcon, this.perianderMetalmarkButterflyIcon], 0.05, this);

        let startX = this.getGameWidth() * 0.70;
        let y = this.getGameHeight() * 0.03;
        let spacing = this.getGameWidth() * 0.02;
        this.birdwingButterflyIcon.setPosition(startX, y);
        this.hairstreakButterflyIcon.setPosition(this.birdwingButterflyIcon.x + this.birdwingButterflyIcon.displayWidth + spacing, y);
        this.lunaMothButterflyIcon.setPosition(this.hairstreakButterflyIcon.x + this.hairstreakButterflyIcon.displayWidth + spacing, y);
        this.perianderMetalmarkButterflyIcon.setPosition(this.lunaMothButterflyIcon.x + this.lunaMothButterflyIcon.displayWidth + spacing, y);
    }

    update(time: number, _: number)
    {
        if(!this.isUpdating)
        {
            return;
        }

        this.isPreviousUpDown = this.isUpDown;
        this.isPreviousLeftDown = this.isLeftDown;
        this.isPreviousRightDown = this.isRightDown;
        this.isPreviousDownDown = this.isDownDown;

        this.isUpDown = this.isTouchUpDown || this.cursors!.up.isDown;
        this.isLeftDown = this.isTouchLeftDown || this.cursors!.left.isDown;
        this.isRightDown = this.isTouchRightDown || this.cursors!.right.isDown;
        this.isDownDown = this.isTouchDownDown || this.cursors!.down.isDown;

        if(!this.isCatching)
        {
            let vel: Phaser.Math.Vector2 = new Phaser.Math.Vector2();

            if (this.isUpDown) 
            {
                this.meganDirection = "up";
                vel.y = -this.playerVelocity;
            }
            if (this.isDownDown) 
            {
                this.meganDirection = "down";
                vel.y = this.playerVelocity;
            }

            if (this.isRightDown) 
            {
                this.meganDirection = "right";
                vel.x = this.playerVelocity;
            }
            if (this.isLeftDown) 
            {
                this.meganDirection = "left";
                vel.x = -this.playerVelocity;
            }

            vel = vel.normalize().scale(this.playerVelocity);

            if(vel.lengthSq() > 0) {
                this.megan.setVelocity(vel.x, vel.y);
                this.megan.play('megan_walk_' + this.meganDirection, true);
            } 

            if(!this.isUpDown && !this.isDownDown && !this.isRightDown && !this.isLeftDown)
            {
                this.megan.play('megan_idle_' + this.meganDirection, true);

                // this.megan.on(Animations.Events.ANIMATION_UPDATE, (a:Animations.Animation, b:Animations.AnimationFrame, c:GameObjects.Sprite, frameKey: string) => {
                //     if(a.key == "megan_idle_down")
                //     {
                //         console.log(a, b.index, c, frameKey);
                //     }
                // });
            }

            if( (!this.isUpDown && this.isPreviousUpDown) ||
                (!this.isLeftDown && this.isPreviousLeftDown) ||
                (!this.isRightDown && this.isPreviousRightDown) ||
                (!this.isDownDown && this.isPreviousDownDown)) {
                    this.megan.setVelocity(0, 0);
            }

            if(this.interactKey)
            {
                this.isPreviousInteractKeyDown = this.isInteractKeyDown;
                this.isInteractKeyDown = this.interactKey.isDown;
            }

            if(!this.isPreviousInteractKeyDown && this.isInteractKeyDown)
            {
                this.megan.play('megan_catching_' + this.meganDirection, true);
                this.isCatching = true;
                this.megan.setVelocity(0, 0);
                //console.log(this.map.getTileAtWorldXY(this.megan.x, this.megan.y, true, this.camera));
            }
        }

        this.updateButterflies(time);

        // if(this.megan.x + vel.x > this.xLimit || 
        //    this.megan.x + vel.x < 0 || 
        //    this.megan.y + vel.y > this.yLimit || 
        //    this.megan.y + vel.y < 0)
        // {
        //     this.megan.setVelocity(0, 0);
        // }
    }

    updateButterflies(time: number)
    {
        let xCycle = Math.cos(time / 1000) * this.tilemapScale / 4;
        let yCycle = Math.cos(time / 500) * this.tilemapScale / 4;

        for(const butterfly of this.butterflies)
        {
            butterfly.setPosition(butterfly.x + xCycle, butterfly.y + yCycle);
        }
    }
}
