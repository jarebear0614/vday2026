import { Align } from '../util/align';
import { DEFAULT_SPRITE_FRAMERATE, DEFAULT_SPRITE_SCALE } from '../util/const';
import { BaseScene } from './BaseScene';

export class Game extends BaseScene
{
    camera: Phaser.Cameras.Scene2D.Camera;

    constructor ()
    {
        super('Game');
    }

    preload()
    {
        this.load.spritesheet('megan', 'assets/megan/Megan-Idle.png', {frameWidth: 32, frameHeight: 32})
    }

    create ()
    {
        super.create();

        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x000000);

        let megan = this.add.sprite(10, 10, 'megan', 0).setOrigin(0, 0);

        Align.scaleToGameWidth(megan, DEFAULT_SPRITE_SCALE, this);

        this.anims.create({
            key: 'megan_idle_down',
            frames: this.anims.generateFrameNumbers('megan', {start: 0, end: 3}),
            frameRate: DEFAULT_SPRITE_FRAMERATE,
            repeat: -1
        });
        
       megan.play('megan_idle_down');
    }
}
