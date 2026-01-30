import { Types } from "phaser";
import { ICharacterMovement } from "../movement/ICharacterMovement";
import { BaseScene } from "../scenes/BaseScene";
import { DEFAULT_IDLE_SPRITE_FRAMERATE, DEFAULT_WALK_SPRITE_FRAMERATE } from "../util/const";

export class NPC 
{
    scene: BaseScene;
    name: string;
    instance: string;
    movement: ICharacterMovement;
    body: Types.Physics.Arcade.SpriteWithDynamicBody;

    constructor(scene: BaseScene, name: string, instance: string, body: Types.Physics.Arcade.SpriteWithDynamicBody, movement: ICharacterMovement)
    {
        this.scene = scene;
        this.name = name;
        this.instance = instance;
        this.body = body;
        this.movement = movement;

        this.movement.setCharacter(this.name, this.body);
        this.configure();
    }

    private configure()
    {
        this.scene.anims.create({
            key: this.name.toLowerCase() + '_idle_down',
            frames: this.scene.anims.generateFrameNumbers(this.name.toLowerCase() + '_idle', {start: 0, end: 3}),
            frameRate: DEFAULT_IDLE_SPRITE_FRAMERATE,
            repeat: -1
        });

        this.scene.anims.create({
            key: this.name.toLowerCase() + '_idle_up',
            frames: this.scene.anims.generateFrameNumbers(this.name.toLowerCase() + '_idle', {start: 4, end: 7}),
            frameRate: DEFAULT_IDLE_SPRITE_FRAMERATE,
            repeat: -1
        });

        this.scene.anims.create({
            key: this.name.toLowerCase() + '_idle_right',
            frames: this.scene.anims.generateFrameNumbers(this.name.toLowerCase() + '_idle', {start: 8, end: 11}),
            frameRate: DEFAULT_IDLE_SPRITE_FRAMERATE,
            repeat: -1
        });

        this.scene.anims.create({
            key: this.name.toLowerCase() + '_idle_left',
            frames: this.scene.anims.generateFrameNumbers(this.name.toLowerCase() + '_idle', {start: 12, end: 15}),
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
            frames: this.scene.anims.generateFrameNumbers(this.name.toLowerCase() + '_walk', {start: 6, end: 11}),
            frameRate: DEFAULT_WALK_SPRITE_FRAMERATE,
            repeat: -1
        });

        this.scene.anims.create({
            key: this.name.toLowerCase() + '_walk_right',
            frames: this.scene.anims.generateFrameNumbers(this.name.toLowerCase() + '_walk', {start: 12, end: 17}),
            frameRate: DEFAULT_WALK_SPRITE_FRAMERATE,
            repeat: -1
        });

        this.scene.anims.create({
            key: this.name.toLowerCase() + '_walk_left',
            frames: this.scene.anims.generateFrameNumbers(this.name.toLowerCase() + '_walk', {start: 18, end: 23}),
            frameRate: DEFAULT_WALK_SPRITE_FRAMERATE,
            repeat: -1
        });

        this.body.play(this.name.toLowerCase() + '_idle_down');
    }

    update(delta: number)
    {
        this.movement?.update(delta);
    }
}