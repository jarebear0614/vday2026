import { Display, GameObjects, Math, Tilemaps, Types } from 'phaser';
import { Align } from '../util/align';
import { DEFAULT_IDLE_SPRITE_FRAMERATE, DEFAULT_SPRITE_SCALE, DEFAULT_WALK_SPRITE_FRAMERATE, TILE_SCALE, TILE_SIZE } from '../util/const';
import { BaseScene } from './BaseScene';
import AnimatedTilesPlugin from '../plugins/animated_tiles/animated_tiles';

export class Game extends BaseScene
{
    camera: Phaser.Cameras.Scene2D.Camera;

    megan: Types.Physics.Arcade.SpriteWithDynamicBody;
    
    meganDirection: string = 'down';
    playerVelocity: number = 256;

    cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;

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
    aboveLayer: Tilemaps.TilemapLayer;
    aboveDecoration1Layer: Tilemaps.TilemapLayer;
    aboveDecoration2Layer: Tilemaps.TilemapLayer;
    aboveDecoration3Layer: Tilemaps.TilemapLayer;

    tilesets: Tilemaps.Tileset[] = [];

    xLimit: number = 0;
    yLimit: number = 0;
    tilemapScale: number = 0;

    public animatedTiles!: AnimatedTilesPlugin; 

    debugGraphics: GameObjects.Graphics;

    constructor ()
    {
        super('Game');
    }

    preload()
    {
        this.load.spritesheet('megan_idle', 'assets/megan/Megan-Idle.png', {frameWidth: 32, frameHeight: 32});
        this.load.spritesheet('megan_walk', 'assets/megan/Megan-Walk.png', {frameWidth: 32, frameHeight: 32});

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

        this.configureTilemaps();
        this.configurePlayer();
        this.configureForegroundTilemaps();
        this.configureInput();

        this.animatedTiles.init(this.map);
        this.animatedTiles.setRate(0.5);

        this.debugGraphics = this.add.graphics().setAlpha(0.75);
    }

    configurePlayer()
    {
        this.megan = this.physics.add.sprite(10, 10, 'megan', 0).setOrigin(0, 0).setGravity(0, 0);
        Align.scaleToGameWidth( this.megan, DEFAULT_SPRITE_SCALE, this);

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
        
        this.megan.play('megan_idle_' + this.meganDirection);

        this.camera.startFollow(this.megan, true, 1.0, 1.0, 0.0, 0.0);
        this.camera.setBounds(0, 0, this.xLimit, this.yLimit);
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

    private configureTilemaps() {        
        this.map = this.make.tilemap({key: 'main'});

        this.grassSpringTileset = this.map.addTilesetImage('Grass Spring Extruded', 'grass_spring_tileset', 16, 16, 1, 2)!;
        this.grassWaterSpringTileset = this.map.addTilesetImage('Grass Water Spring Extruded', 'grass_water_spring_tileset', 16, 16, 1, 2)!;
        this.waterFountainTileset = this.map.addTilesetImage('Water fountain extruded', 'water_fountain_tileset', 16, 16, 1, 2)!;
        this.birchTreeTileset = this.map.addTilesetImage('Birch Tree Extruded', 'birch_tree_tileset', 16, 16, 1, 2)!;
        this.housesTileset = this.map.addTilesetImage('Houses Extruded', 'houses_tileset', 16, 16, 1, 2)!;
        this.housingDecorationsTileset = this.map.addTilesetImage('House Decorations Extruded', 'house_decorations_tileset', 16, 16, 1, 2)!;

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
        this.aboveLayer = this.map.createLayer('above', this.tilesets)!;

        this.tilemapScale = (this.getGameWidth() * TILE_SCALE) / TILE_SIZE;
        backgroundLayer?.setScale(this.tilemapScale, this.tilemapScale);
        backgroundLayerDecoration?.setScale(this.tilemapScale, this.tilemapScale);
        this.aboveLayer.setScale(this.tilemapScale, this.tilemapScale);

        this.xLimit = this.map.widthInPixels * this.tilemapScale;
        this.yLimit = this.map.heightInPixels * this.tilemapScale;

        this.housingDecorationsTileset.tileOffset = new Math.Vector2(0, this.housingDecorationsTileset.tileOffset.y * -this.tilemapScale);
    }

    //call after configuring the player
    private configureForegroundTilemaps()
    {
        this.collidersLayer = this.map.createLayer('colliders', this.tilesets)!;
        this.aboveLayer = this.map.createLayer('above', this.tilesets)!;
        this.aboveDecoration1Layer = this.map.createLayer('above_decoration_1', this.tilesets)!;        
        this.aboveDecoration2Layer = this.map.createLayer('above_decoration_2', this.tilesets)!;
        this.aboveDecoration3Layer = this.map.createLayer('above_decoration_3', this.tilesets)!;

        this.collidersLayer.setScale(this.tilemapScale, this.tilemapScale);
        
        this.aboveDecoration1Layer.setScale(this.tilemapScale, this.tilemapScale);
        this.aboveDecoration2Layer.setScale(this.tilemapScale, this.tilemapScale);
        this.aboveDecoration3Layer.setScale(this.tilemapScale, this.tilemapScale);

        this.physics.add.collider(this.megan, this.collidersLayer);
        this.collidersLayer.setCollisionByExclusion([-1], true);
    }

    update(_: number, __: number)
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
        }

        if( (!this.isUpDown && this.isPreviousUpDown) ||
            (!this.isLeftDown && this.isPreviousLeftDown) ||
            (!this.isRightDown && this.isPreviousRightDown) ||
            (!this.isDownDown && this.isPreviousDownDown)) {
                this.megan.setVelocity(0, 0);
        }
    }
}
