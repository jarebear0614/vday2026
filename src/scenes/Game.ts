import { Animations, GameObjects, Sound, Tilemaps, Types } from 'phaser';
import { Align } from '../util/align';
import { BIRDWING_BUTTERFLY_NAME, CATCHING_DISTANCE, DEFAULT_BUTTERFLY_SCALE, DEFAULT_BUTTERFLY_SPRITE_FRAMERATE, DEFAULT_CATCH_SPRITE_FRAMERATE, DEFAULT_EFFECT_FRAMERATE, DEFAULT_IDLE_SPRITE_FRAMERATE, DEFAULT_SPRITE_SCALE, DEFAULT_WALK_SPRITE_FRAMERATE, HAIRSTREAK_BUTTERFLY_NAME, LUNAMOTH_BUTTERFLY_NAME, PERIANDER_BUTTERFLY_NAME, TILE_SCALE, TILE_SIZE } from '../util/const';
import { BaseScene } from './BaseScene';
import AnimatedTilesPlugin from '../plugins/animated_tiles/animated_tiles';
import { NPCMovementConfig, NopCharacterMovement, RandomInRadiusCharacterMovement, WaypointCharacterMovement } from '../movement/CharacterMovementComponents';
import { NPC, NPCEventConfig } from '../character/NPC';
import { ICharacterMovement } from '../movement/ICharacterMovement';

import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
import { Interactive, InteractiveConfig, InteractiveTriggerConfig } from '../events/interactive';
import { EVENT_KEY_MAX, GameEventManager } from '../events/gameEvents';
import { EndAction, EventEndAction, NPCEventEndAction, NPCEventUtility, OverlapAction } from '../events/dialog';
import { npcEvents } from '../util/events';

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
    grassDeepForestTileset: Tilemaps.Tileset;
    grassWaterDeepForestTileset: Tilemaps.Tileset;
    waterFountainTileset: Tilemaps.Tileset;
    birchTreeTileset: Tilemaps.Tileset;
    pineTreeTileset: Tilemaps.Tileset;
    housesTileset: Tilemaps.Tileset;
    housingDecorationsTileset: Tilemaps.Tileset;
    bigTreeTileset: Tilemaps.Tileset;
    deepForestBushes: Tilemaps.Tileset;
    deepForestFantasyMushroom1: Tilemaps.Tileset;
    deepForestFantasyMushroom2: Tilemaps.Tileset;
    deepForestMushroomTree: Tilemaps.Tileset;
    deepForestTrees: Tilemaps.Tileset;

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

    theme: Sound.BaseSound;

    npcs: NPC[] = [];
    currentInteractiveObject: Interactive | null = null;
    gameEventManager: GameEventManager = new GameEventManager();

    animatedTiles!: AnimatedTilesPlugin; 
    
    rexUI: RexUIPlugin;
    dialog: RexUIPlugin.Dialog | null;

    constructor ()
    {
        super('Game');
    }

    init()
    {
        this.cameras.main.fadeOut(1);

        this.currentInteractiveObject = null;

        this.load.on('complete', (loader: any, totalComplete: number, totalFailed: number) => 
        {
            console.log(loader, totalComplete, totalFailed);
            this.cameras.main.fadeIn(300);
        });
    }

    preload()
    {
        this.load.spritesheet('transparent', 'assets/transparent.png', {frameWidth: 8, frameHeight: 8});
        this.load.spritesheet('megan_idle', 'assets/megan/Megan-Idle.png', {frameWidth: 32, frameHeight: 32});
        this.load.spritesheet('megan_walk', 'assets/megan/Megan-Walk.png', {frameWidth: 32, frameHeight: 32});
        this.load.spritesheet('megan_catching', 'assets/megan/Megan-Catching.png', {frameWidth: 32, frameHeight: 32});

        this.load.spritesheet('jared_idle', 'assets/jared/Jared-Idle.png', {frameWidth: 32, frameHeight: 32});
        this.load.spritesheet('jared_walk', 'assets/jared/Jared-Walk.png', {frameWidth: 32, frameHeight: 32});
        this.load.spritesheet('jared-fake_idle', 'assets/jared/Jared-Fake-Idle.png', {frameWidth: 32, frameHeight: 32});
        this.load.spritesheet('jared-fake_walk', 'assets/jared/Jared-Fake-Walk.png', {frameWidth: 32, frameHeight: 32});

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
        this.load.image('grass_deep_forest_tileset', 'assets/tilesets/Grass Deep Forest Extruded.png');
        this.load.image('grass_water_deep_forest_tileset', 'assets/tilesets/Grass Water Deep Forest Extruded.png');
        this.load.image('water_fountain_tileset', 'assets/tilesets/Water fountain extruded.png');

        this.load.image('birch_tree_tileset', 'assets/tilesets/Birch Tree Extruded.png');
        this.load.image('pine_tree_tileset', 'assets/tilesets/Pine Tree Extruded.png');

        this.load.image('houses_tileset', 'assets/tilesets/Houses Extruded.png');
        this.load.image('house_decorations_tileset', 'assets/tilesets/House Decorations Extruded.png');

        this.load.image('big_tree_tileset', 'assets/tilesets/Big Tree Extruded.png');
        this.load.image('deep_forest_bushes_tileset', 'assets/tilesets/Deep Forest Bushes Extruded.png');
        this.load.image('deep_forest_mushroom1_tileset', 'assets/tilesets/Deep Forest Fantasy Mushroom 1 Extruded.png');
        this.load.image('deep_forest_mushroom2_tileset', 'assets/tilesets/Deep Forest Fantasy Mushroom 2 Extruded.png');
        this.load.image('deep_forest_mushroom_tree_tileset', 'assets/tilesets/Deep Forest Mushroom Tree Extruded.png');
        this.load.image('deep_forest_tree_tileset', 'assets/tilesets/Deep Forest Tree Extruded.png');

        this.load.tilemapTiledJSON('main', 'assets/maps/main.tmj');

        this.load.audio('labyrinth', 'assets/music/labyrinth.mp3');

        this.load.scenePlugin({
            key: 'rexuiplugin',
            url: 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js',
            sceneKey: 'rexUI'
        });    
    }

    create ()
    {
        super.create();

        this.gameEventManager.purgeCharactersFromEvents();

        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x000000);

        this.configureSceneEvents();
        this.configureTilemaps();
        this.configurePlayer();
        this.configureEffects();
        this.configureAnimationEvents();
        this.configureForegroundTilemaps();
        this.configureInput();
        this.configureCharacterObjects();
        this.configureButterflies();
        this.configureUI();
        this.configureMusic();

        
        this.configureEvent();

        this.animatedTiles.init(this.map);
        this.animatedTiles.setRate(0.5);
    }

    configureSceneEvents() 
    {

    } 

    configurePlayer()
    {
        this.megan = this.physics.add.sprite(100, 100, 'megan', 0).setSize(TILE_SIZE, TILE_SIZE).setOrigin(0, 0).setGravity(0, 0);
        Align.scaleToGameWidth(this.megan, DEFAULT_SPRITE_SCALE, this);

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
        this.grassDeepForestTileset = this.map.addTilesetImage('Grass Deep Forest Extruded', 'grass_deep_forest_tileset', 16, 16, 1, 2)!;
        this.grassWaterDeepForestTileset = this.map.addTilesetImage('Grass Water Deep Forest Extruded', 'grass_water_deep_forest_tileset', 16, 16, 1, 2)!;
        this.waterFountainTileset = this.map.addTilesetImage('Water fountain extruded', 'water_fountain_tileset', 16, 16, 1, 2)!;
        this.birchTreeTileset = this.map.addTilesetImage('Birch Tree Extruded', 'birch_tree_tileset', 16, 16, 1, 2)!;
        this.pineTreeTileset = this.map.addTilesetImage('Pine Tree Extruded', 'pine_tree_tileset', 16, 16, 1, 2)!;
        this.housesTileset = this.map.addTilesetImage('Houses Extruded', 'houses_tileset', 16, 16, 1, 2)!;

        this.housingDecorationsTileset = this.map.addTilesetImage('House Decorations Extruded', 'house_decorations_tileset', 16, 16, 1, 2)!;
        this.housingDecorationsTileset.tileOffset = new Phaser.Math.Vector2(0, this.housingDecorationsTileset.tileOffset.y * -this.tilemapScale);

        this.bigTreeTileset = this.map.addTilesetImage('Big Tree Extruded', 'big_tree_tileset', 16, 16, 1, 2)!
        this.deepForestBushes = this.map.addTilesetImage('Deep Forest Bushes Extruded', 'deep_forest_bushes_tileset', 16, 16, 1, 2)!
        this.deepForestFantasyMushroom1 = this.map.addTilesetImage('Deep Forest Fantasy Mushroom 1 Extruded', 'deep_forest_mushroom1_tileset', 16, 16, 1, 2)!
        this.deepForestFantasyMushroom2 = this.map.addTilesetImage('Deep Forest Fantasy Mushroom 2 Extruded', 'deep_forest_mushroom2_tileset', 16, 16, 1, 2)!
        this.deepForestMushroomTree = this.map.addTilesetImage('Deep Forest Mushroom Tree Extruded', 'deep_forest_mushroom_tree_tileset', 16, 16, 1, 2)!
        this.deepForestTrees = this.map.addTilesetImage('Deep Forest Tree Extruded', 'deep_forest_tree_tileset', 16, 16, 1, 2)!

        this.tilesets = 
        [
            this.grassSpringTileset,
            this.grassWaterSpringTileset,
            this.grassDeepForestTileset,
            this.grassWaterDeepForestTileset,
            this.waterFountainTileset,
            this.birchTreeTileset,
            this.housesTileset,
            this.housingDecorationsTileset,
            this.pineTreeTileset,
            this.bigTreeTileset,
            this.deepForestBushes,
            this.deepForestFantasyMushroom1,
            this.deepForestFantasyMushroom2,
            this.deepForestMushroomTree,
            this.deepForestTrees
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

    configureCharacterObjects()
    {
        let characterObjects = this.map.getObjectLayer('map_character')!.objects;
        let localNpcs: NPC[] = [];

        for(const character of characterObjects) 
        {
            const {x, y, name, properties, type } = character;

            let instance: string = '';
            let movement: NPCMovementConfig = new NPCMovementConfig();
            let eventKeyTrigger: number = 0;
            let eventKeyEnd: number | undefined = undefined;
            let eventName: string = "";

            for (const property of properties) 
            {
                switch (property.name) {
                    case "instance":
                        instance = property.value;
                        break;
                    case 'movement':
                        movement = JSON.parse(property.value.toString());
                        break;
                    case "eventName":
                        eventName = property.value;
                        break;
                    case 'eventKeyTrigger':
                        eventKeyTrigger = parseInt(property.value);
                        break;
                    case 'eventKeyEnd':
                        eventKeyEnd = parseInt(property.value);
                        break;
                }
            }

            let ev = npcEvents[eventName];
            let dialog = ev.npc.find((f) => { return f.instance == instance; });

            let npcEventConfig: NPCEventConfig = new NPCEventConfig();
            if(eventName !== "")
            {
                npcEventConfig.eventName = eventName;
                npcEventConfig.eventKeyTrigger = eventKeyTrigger
                npcEventConfig.eventKeyEnd = eventKeyEnd;
                npcEventConfig.onEnd = dialog ? dialog.events[dialog.events.length - 1].onEnd : EndAction.nop;
            }

            let possibleExistingNPC = localNpcs.find((c) =>
            {
                return c.name == name && c.instance == instance;
            });


            let newNPC = possibleExistingNPC ? possibleExistingNPC : new NPC(this, 
                                       name, 
                                       instance, 
                                       x!, 
                                       y!, 
                                       this.tilemapScale, 
                                       this.getMovementFromConfig(x! * this.tilemapScale, y! * this.tilemapScale, movement), 
                                       npcEventConfig,
                                       {
                                            player: this.megan,
                                            overlapCallback: () =>
                                            {   
                                                let ev = this.gameEventManager.getCurrentEventProgress(eventName);
                                                if(ev !== undefined)
                                                {
                                                    let messages = NPCEventUtility.findEventByKey(dialog!, ev);
                                                    if(messages !== undefined)
                                                    {
                                                        if(messages.overlapAction == OverlapAction.stop)
                                                        {
                                                            newNPC.movement?.pause();
                                                        }

                                                        if(ev >= eventKeyTrigger)
                                                        {
                                                            this.currentInteractiveObject = new Interactive(messages.dialog, type, eventName, eventKeyTrigger, {
                                                                title: name,
                                                                endAction: messages.onEnd,
                                                                sourceCharacter: newNPC,
                                                                grantedItem: messages.item,
                                                                sceneTransition: messages.scene ? {
                                                                    toScene: messages.scene,
                                                                    fromX: messages.fromX ?? 0,
                                                                    fromY: messages.fromY ?? 0
                                                                } : undefined
                                                            });

                                                            if(messages.overlapAction == OverlapAction.autoTrigger)
                                                            {
                                                                this.triggerInteractiveEvent({
                                                                    type: this.currentInteractiveObject?.type ?? 'sign',
                                                                    interactive: this.currentInteractiveObject,
                                                                    scene: undefined
                                                                }, newNPC);
                                                            }
                                                        }
                                                    }
                                                }
                                            },
                                       });

            if(!possibleExistingNPC)
            {
                localNpcs.push(newNPC);
            }

            for(let d of dialog?.events ?? [])
            {
                this.gameEventManager.addEvent(eventName, d.eventKey, [newNPC], {
                    onNpcEnd: ev.npcOnEnd,
                    npcEndConfig: ev.npcOnEndConfig,
                    eventEnd: ev.eventOnEnd,
                    eventEndConfig: ev.eventEndConfig
                });                     

                for(let npc of localNpcs)
                {
                    if(npc.eventConfig?.eventName == eventName && (npc.getEventKeyEnd() ?? EVENT_KEY_MAX) < (eventKeyEnd ?? EVENT_KEY_MAX))
                    {
                        this.gameEventManager.addEvent(eventName, d.eventKey, [npc], {
                            onNpcEnd: ev.npcOnEnd,
                            npcEndConfig: ev.npcOnEndConfig,
                            eventEnd: ev.eventOnEnd,
                            eventEndConfig: ev.eventEndConfig
                        });
                    }
                }
            }
        }
    }

    private getMovementFromConfig(x: number, y: number, config: NPCMovementConfig): ICharacterMovement
    {
        switch(config.type)
        {
            case "random":
                return new RandomInRadiusCharacterMovement(x, y, 16 * this.tilemapScale * config.radius, config.waitBetween);
            case "waypoint":
                return new WaypointCharacterMovement(x, y, this.tilemapScale, config);
            default:
                return new NopCharacterMovement();
        }
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
                    this.spawnBirdwingButterfly(x! * this.tilemapScale, y! * this.tilemapScale);
                    break;
                case 'hairstreak':
                    this.spawnHairstreakButterfly(x! * this.tilemapScale, y! * this.tilemapScale);
                    break;
                case 'lunamoth':
                    this.spawnLunaMothButterfly(x! * this.tilemapScale, y! * this.tilemapScale);
                    break;
                case 'periander':
                    this.spawnPerianderButterfly(x! * this.tilemapScale, y! * this.tilemapScale);
                    break;
            }
        }
    }

    private spawnBirdwingButterfly(x: number, y: number) {
        this.birdwingButterfly = this.physics.add.sprite(x, y, 'birdwing_butterfly', 0).setName(BIRDWING_BUTTERFLY_NAME);
        Align.scaleToGameWidth(this.birdwingButterfly, DEFAULT_BUTTERFLY_SCALE, this);

        this.anims.create({
            key: 'birdwing_butterfly_flap',
            frames: this.anims.generateFrameNumbers('birdwing_butterfly', { start: 0, end: 6 }),
            frameRate: DEFAULT_BUTTERFLY_SPRITE_FRAMERATE,
            repeat: -1
        });

        this.birdwingButterfly.play('birdwing_butterfly_flap');

        this.butterflies.push(this.birdwingButterfly);
    }

    private spawnHairstreakButterfly(x: number, y: number) {
        this.hairstreakButterfly = this.physics.add.sprite(x, y, 'hairstreak_butterfly', 0).setName(HAIRSTREAK_BUTTERFLY_NAME);
        Align.scaleToGameWidth(this.hairstreakButterfly, DEFAULT_BUTTERFLY_SCALE, this);

        this.anims.create({
            key: 'hairstreak_butterfly_flap',
            frames: this.anims.generateFrameNumbers('hairstreak_butterfly', { start: 0, end: 6 }),
            frameRate: DEFAULT_BUTTERFLY_SPRITE_FRAMERATE,
            repeat: -1
        });

        this.hairstreakButterfly.play('hairstreak_butterfly_flap');

        this.butterflies.push(this.hairstreakButterfly);
    }

    private spawnLunaMothButterfly(x: number, y: number) {
        this.lunaMothButterfly = this.physics.add.sprite(x, y, 'lunamoth_butterfly', 0).setName(LUNAMOTH_BUTTERFLY_NAME);
        Align.scaleToGameWidth(this.lunaMothButterfly, DEFAULT_BUTTERFLY_SCALE, this);

        this.anims.create({
            key: 'lunamoth_butterfly_flap',
            frames: this.anims.generateFrameNumbers('lunamoth_butterfly', { start: 0, end: 6 }),
            frameRate: DEFAULT_BUTTERFLY_SPRITE_FRAMERATE,
            repeat: -1
        });

        this.lunaMothButterfly.play('lunamoth_butterfly_flap');

        this.butterflies.push(this.lunaMothButterfly);
    }
    
    private spawnPerianderButterfly(x: number, y: number) {
        this.perianderMetalmarkButterfly = this.physics.add.sprite(x, y, 'periander_metalmark_butterfly', 0).setName(PERIANDER_BUTTERFLY_NAME);
        Align.scaleToGameWidth(this.perianderMetalmarkButterfly, DEFAULT_BUTTERFLY_SCALE, this);

        this.anims.create({
            key: 'periander_butterfly_flap',
            frames: this.anims.generateFrameNumbers('periander_metalmark_butterfly', { start: 0, end: 6 }),
            frameRate: DEFAULT_BUTTERFLY_SPRITE_FRAMERATE,
            repeat: -1
        });

        this.perianderMetalmarkButterfly.play('periander_butterfly_flap');

        this.butterflies.push(this.perianderMetalmarkButterfly);
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

    configureMusic()
    {
        if(!this.theme)
        {
            this.theme = this.sound.add('labyrinth', {
                loop: true,
                volume: 0.35
            });
        }

        if(!this.theme.isPlaying)
        {
            this.theme.play();
        }
    }

    update(time: number, delta: number)
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
                if(this.currentInteractiveObject)
                {
                    this.triggerInteractiveEvent({
                        type: this.currentInteractiveObject?.type ?? 'sign',
                        interactive: this.currentInteractiveObject,
                        scene: this.currentInteractiveObject?.sceneTransition
                    }, this.currentInteractiveObject.sourceCharacter);
                }
                else
                {
                    this.megan.play('megan_catching_' + this.meganDirection, true);
                    this.isCatching = true;
                    this.megan.setVelocity(0, 0);
                }
            }

            this.wasPlayerTouching = this.playerTouching;
            this.playerTouching = this.megan.body.embedded;
            
            if(this.wasPlayerTouching && !this.playerTouching) 
            {
                this.currentInteractiveObject?.sourceCharacter?.movement?.unpause();
                this.currentInteractiveObject = null;
            }

            let events = this.gameEventManager.getCurrentGameEvents();
            for(let ev of events)
            {
                ev.update(delta);
            }

            // if(this.currentInteractiveObject && !this.interactText.visible)
            // {
            //     this.interactText.setVisible(true);
            // }
            // else if(this.currentInteractiveObject == null && this.interactText.visible)
            // {
            //     this.interactText.setVisible(false);
            // }
        }

        this.updateButterflies(time);

        for(const npc of this.npcs)
        {
            npc.update(delta);
        }

        if(this.megan.x < 0)
        {
            this.megan.x = 0;
        }
        if(this.megan.y < 0)
        {
            this.megan.y = 0;
        }
        if(this.megan.x > this.xLimit)
        {
            this.megan.x = this.xLimit;
        }
        if(this.megan.y > this.yLimit)
        {
            this.megan.y = this.yLimit;
        }
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

    private configureEvent() 
    {
        let events = this.gameEventManager.getCurrentGameEvents();

        for(let i = 0; i < events.length; ++i)
        {
            events[i].activate();
        }
    }

    private incrementEvent(name: string | undefined) 
    {
        if(name)
        {
            let deactivateInfo = this.gameEventManager.incrementEvent(name);

            let activation = 0;
            let callback = (onEnd: EndAction) =>
            {
                activation++;
                if(activation == deactivateInfo?.npcs.length)
                {
                    deactivateInfo.callback();
                    
                    if(deactivateInfo?.isEventEnding)
                    {
                        switch(deactivateInfo.eventEndAction)
                        {
                            case EventEndAction.spawnBirdwingButterfly:
                                let instance = deactivateInfo.eventEndConfig?.spawnLocationNPCInstance;
                                let npc = deactivateInfo.npcs.find((f) => f.instance == instance);
                                if(npc)
                                {
                                    this.spawnBirdwingButterfly(npc.body.x, npc.body.y);
                                }
                                break;
                        }
                    }
                }
            }
            
            if(deactivateInfo && deactivateInfo.onNpcEnd == NPCEventEndAction.fadeOut)
            {
                for(let npc of deactivateInfo.npcs)
                {
                    npc.fadeOut(deactivateInfo.npcEndConfig?.fadeDuration ?? 400, callback);
                }
            }

            this.configureEvent();
        }
    }

    private triggerInteractiveEvent(config: InteractiveTriggerConfig, sourceNPC?: NPC) 
    {
        if(!config)
        {
            return;
        }

        if (config.interactive !== null) {
            switch (config.type) {
                case "sign":
                case "character":
                    if(config.interactive)
                    {
                        this.showDialog(config.interactive.messages, sourceNPC, {
                            title: config.interactive.title,
                            endAction: config.interactive.endAction,
                            sourceCharacter: config.interactive.sourceCharacter,
                            grantedItem: config.interactive.grantedItem
                        });
                    }
                    break;

                // case "scene":
                //     if(config.scene)
                //     {
                //         this.triggerSceneFromConfig(config.scene);
                //     }
                //     break;

                // case "grantItem":
                //     if(config.interactive && config.interactive.grantedItem)
                //     {
                //         this.showDialog(config.interactive.messages, {
                //             title: config.interactive.title,
                //             endAction: config.interactive.endAction,
                //             sourceCharacter: config.interactive.sourceCharacter,
                //             grantedItem: config.interactive.grantedItem
                //         });

                //         this.grantItem(config.interactive.grantedItem, config.interactive.eventName)
                //     }
                //     break;
            }
        }
    }

    private showDialog(messages: string[], sourceNPC?: NPC, config?: InteractiveConfig)
    {             
        if(this.dialog != null) 
        {
            return;
        }

        let messagesIndex = 0;

        this.dialog = this.rexUI.add.dialog({
            x: this.getGameWidth() * 0.10 + (this.getGameWidth() * 0.85) / 2,
            y: this.getGameHeight() * 0.80,
            width: this.getGameWidth() * 0.85,

            background: this.rexUI.add.roundRectangle(0, 0, 40, 100, 20, 0x58a780),
            title: config?.title === undefined ? undefined : this.rexUI.add.label({
                background: this.rexUI.add.roundRectangle(0, 0, 40, 40, 20, 0x79B999),
                text: this.add.text(0, 0, config?.title ?? 'Error', {fontSize: '24px'}),
                space: {
                    left: 10,
                    right: 10,
                    top: 10,
                    bottom: 10
                }
            }),

            content: this.rexUI.add.label({
                background: undefined,

                text: this.rexUI.wrapExpandText(this.add.text(0, 0, messages[messagesIndex])),
                expandTextWidth: true
            }),

            actions: [this.rexUI.add.label({
                background: this.rexUI.add.roundRectangle(0, 0, 40, 40, 20, 0x79B999),
                text: this.add.text(0, 0, messages.length > 1 ? 'Next' : 'Close'),
                space: {
                    left: 10,
                    right: 10,
                    top: 10,
                    bottom: 10
                }
            })],

            space: {
                left: 20,
                right: 20,
                top: config?.title === undefined ? 20 : -20,
                bottom: 20,

                title: 25,
                content: 25,
                description: 25,
                descriptionLeft: 20,
                descriptionRight: 20,
                choices: 25,

                toolbarItem: 5,
                choice: 15,
                action: 15,
            },

            expand:
            {
                content: true,
                title: false
            },

            align: {
                title: 'left',
                actions: 'right'
            },

            click: {
                mode: 'release'
            }
        }).layout().setScrollFactor(0).popUp(1000);

        this.dialog
            .on('button.click', (button: any, groupName: string, index: number, pointer: Phaser.Input.Pointer, event: Event) => 
            {
                if(groupName === 'actions')
                {
                    messagesIndex = messagesIndex + 1;

                    if(messagesIndex == messages.length - 1)
                    {
                        let actions = this.dialog?.getElement('actions') as RexUIPlugin.Label[];
                        actions[0].text = "Close";
                        this.dialog?.layout();
                    }
                    else if(messagesIndex == messages.length) 
                    {
                        this.dialog?.scaleDownDestroy(300);
                        this.dialog = null;

                        config?.sourceCharacter?.movement?.unpause();

                        let endAction = config?.endAction ?? this.currentInteractiveObject?.endAction ?? EndAction.nop;
                        let eventName = config?.eventName ?? this.currentInteractiveObject?.eventName ?? undefined;

                        this.handleEndAction(endAction, eventName, config, sourceNPC);

                        this.currentInteractiveObject = null;
                        return;
                    }

                    let text = this.dialog?.getElement('content') as Phaser.GameObjects.Text;
                    text.text = messages[messagesIndex];
                    
                    this.dialog?.layout();

                    return;
                }

                this.dialog?.scaleDownDestroy(300);
                this.dialog = null;
            })
            .on('button.over', function (button: any, groupName: string, index: number, pointer: Phaser.Input.Pointer, event: Event) 
            {
                button.getElement('background').setStrokeStyle(1, 0xffffff);
            })
            .on('button.out', function (button: any, groupName: string, index: number, pointer: Phaser.Input.Pointer, event: Event) 
            {
                button.getElement('background').setStrokeStyle();
            });            
    }


    private handleEndAction(endAction: EndAction, eventName: string | undefined, config: InteractiveConfig | undefined, sourceNPC: NPC | undefined) 
    {
        if (endAction == EndAction.incrementEvent) 
        {
            this.incrementEvent(eventName);
        }
        else if (endAction == EndAction.grantItem && config?.grantedItem) 
        {
            //this.grantItem(config.grantedItem, eventName);
        }
        else if (endAction == EndAction.clearItem) 
        {
            //this.currentItem?.destroy();
            //this.incrementEvent(eventName);
        }
        else if (endAction == EndAction.spawnBirdwingButterfly && sourceNPC) 
        {
            this.incrementEvent(eventName);
        }
        else if (endAction == EndAction.spawnHairstreakButterfly && sourceNPC) 
        {
            this.incrementEvent(eventName);
        }
        else if (endAction == EndAction.spawnLunaMothButterfly && sourceNPC) 
        {
            this.incrementEvent(eventName);
        }
        else if (endAction == EndAction.spawnPerianderButterfly && sourceNPC) 
        {
            this.incrementEvent(eventName);
        }
    }
}
