import { Types } from "phaser";
import { ICharacterMovement } from "../movement/ICharacterMovement";
import { BaseScene } from "../scenes/BaseScene";
import { DEFAULT_IDLE_SPRITE_FRAMERATE, DEFAULT_SPRITE_SCALE, DEFAULT_WALK_SPRITE_FRAMERATE, TILE_SCALE } from "../util/const";
import { Align } from "../util/align";
import { EndAction } from "../events/dialog";

export class NPCEventConfig
{
    eventName: string;
    eventKeyTrigger: number;
    eventKeyEnd?: number;
    onEnd: EndAction = EndAction.nop;
}

export class NPCOverlapConfig
{
    player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    overlapCallback?: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback;
}

export class NPC 
{
    scene: BaseScene;
    name: string;
    instance: string;
    movement: ICharacterMovement;
    body: Types.Physics.Arcade.SpriteWithDynamicBody;
    private x: number = 0;
    private y: number = 0;
    scale: number = 1;
    idleFrameSpacing: number = 4;
    walkFrameSpacing: number = 4;

    eventConfig?: NPCEventConfig;

    overlapConfig?: NPCOverlapConfig;
    overlapDialogSprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    overlapCollider: Phaser.Physics.Arcade.Collider;

    created: boolean = false;
    destroyed: boolean = false;

    constructor(scene: BaseScene, name: string, instance: string, x: number, y: number, scale: number, idleFrameSpacing: number, walkFrameSpacing: number, movement: ICharacterMovement, eventConfig?: NPCEventConfig, overlapConfig?: NPCOverlapConfig)
    {
        this.scene = scene;
        this.name = name;
        this.instance = instance;
        this.x = x;
        this.y = y;
        this.scale = scale;
        this.movement = movement;
        this.eventConfig = eventConfig;
        this.overlapConfig = overlapConfig;
        this.idleFrameSpacing = idleFrameSpacing;
        this.walkFrameSpacing = walkFrameSpacing;

        this.movement.setNPC(this.name, this);

        this.configure();

        if(!this.eventConfig)
        {
            this.create();
        }
    }

    private configure()
    {
        if(this.scene.anims.exists(this.name.toLowerCase() + '_idle_down'))
        {
            return;
        }
        console.log(this.name);

        this.scene.anims.create({
            key: this.name.toLowerCase() + '_idle_down',
            frames: this.scene.anims.generateFrameNumbers(this.name.toLowerCase() + '_idle', {start: 0, end: this.idleFrameSpacing * 1 - 1}),
            frameRate: DEFAULT_IDLE_SPRITE_FRAMERATE,
            repeat: -1
        });

        this.scene.anims.create({
            key: this.name.toLowerCase() + '_idle_up',
            frames: this.scene.anims.generateFrameNumbers(this.name.toLowerCase() + '_idle', {start: this.idleFrameSpacing * 1, end: this.idleFrameSpacing * 2 - 1}),
            frameRate: DEFAULT_IDLE_SPRITE_FRAMERATE,
            repeat: -1
        });

        this.scene.anims.create({
            key: this.name.toLowerCase() + '_idle_right',
            frames: this.scene.anims.generateFrameNumbers(this.name.toLowerCase() + '_idle', {start: this.idleFrameSpacing * 2, end: this.idleFrameSpacing * 3 - 1}),
            frameRate: DEFAULT_IDLE_SPRITE_FRAMERATE,
            repeat: -1
        });

        this.scene.anims.create({
            key: this.name.toLowerCase() + '_idle_left',
            frames: this.scene.anims.generateFrameNumbers(this.name.toLowerCase() + '_idle', {start: this.idleFrameSpacing * 3, end: this.idleFrameSpacing * 4 - 1}),
            frameRate: DEFAULT_IDLE_SPRITE_FRAMERATE,
            repeat: -1
        });

        this.scene.anims.create({
            key: this.name.toLowerCase() + '_walk_down',
            frames: this.scene.anims.generateFrameNumbers(this.name.toLowerCase() + '_walk', {start: 0, end: 5}),
            frameRate: DEFAULT_WALK_SPRITE_FRAMERATE,
            repeat: -1
        });

        this.scene.anims.create({
            key: this.name.toLowerCase() + '_walk_up',
            frames: this.scene.anims.generateFrameNumbers(this.name.toLowerCase() + '_walk', {start: this.walkFrameSpacing * 1, end: this.walkFrameSpacing * 2 - 1}),
            frameRate: DEFAULT_WALK_SPRITE_FRAMERATE,
            repeat: -1
        });

        this.scene.anims.create({
            key: this.name.toLowerCase() + '_walk_right',
            frames: this.scene.anims.generateFrameNumbers(this.name.toLowerCase() + '_walk', {start: this.walkFrameSpacing * 2, end: this.walkFrameSpacing * 3 - 1}),
            frameRate: DEFAULT_WALK_SPRITE_FRAMERATE,
            repeat: -1
        });

        this.scene.anims.create({
            key: this.name.toLowerCase() + '_walk_left',
            frames: this.scene.anims.generateFrameNumbers(this.name.toLowerCase() + '_walk', {start: this.walkFrameSpacing * 3, end: this.walkFrameSpacing * 4 - 1}),
            frameRate: DEFAULT_WALK_SPRITE_FRAMERATE,
            repeat: -1
        });
    }

    public create()
    {
        console.log(this.name);
        this.body = this.scene.physics.add.sprite(this.x * this.scale, this.y * this.scale, this.name.toLowerCase(), 0);
        Align.scaleToGameWidth(this.body, DEFAULT_SPRITE_SCALE, this.scene);

        this.body.play(this.name.toLowerCase() + '_idle_down');

        this.overlapDialogSprite = this.scene.physics.add.sprite(this.x * this.scale, this.y * this.scale, "transparent", 0);
        this.overlapDialogSprite.setSize(24, 24);
        this.overlapDialogSprite.setPushable(false);
        
        Align.scaleToGameWidth(this.overlapDialogSprite, TILE_SCALE, this.scene); 

        if(this.overlapConfig?.player)
        {
            this.overlapCollider = this.scene.physics.add.overlap(this.overlapConfig.player, this.overlapDialogSprite, this.overlapConfig.overlapCallback);
        }

        this.movement?.setNPC(this.name, this);

        this.created = true;
    }

    public tearDown()
    {
        if(this.created && !this.destroyed)
        {
            this.destroyed = true;

            this.body.destroy();
            this.overlapCollider.destroy();
            this.overlapDialogSprite.destroy();
        }
        
    }

    fadeOut(duration: number, callback?: (onEnd: EndAction) => void)
    {
        this.movement?.pause();
        this.body.play(this.name.toLowerCase() + '_idle_down');

        let fadeOutTween = this.scene.tweens.add({
            targets: this.body,
            alpha: { from: 1, to: 0 },
            ease: 'Linear',
            duration: duration,
            repeat: 0,
            yoyo: false
        });

        fadeOutTween.onCompleteHandler = () =>
        {
            if(callback)
            {
                callback(this.eventConfig?.onEnd ?? EndAction.nop);
            }

            this.scene.tweens.killTweensOf(this.body);
        };
    }

    update(delta: number)
    {
        this.movement?.update(delta);
        this.overlapDialogSprite.setPosition(this.body.x, this.body.y);
        this.overlapDialogSprite.refreshBody();
    }

    getEventKeyTrigger(): number 
    {
        return this.eventConfig?.eventKeyTrigger ?? 0;
    }

    getEventKeyEnd(): number | undefined
    {
        return this.eventConfig?.eventKeyEnd ?? undefined;
    }

    isCreated(): boolean
    {
        return this.created;
    }
}