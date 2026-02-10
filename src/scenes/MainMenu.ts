import { GameObjects } from 'phaser';
import { Align } from '../util/align';
import { BaseScene } from './BaseScene';

export class MainMenu extends BaseScene
{
    background: GameObjects.Image;

    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        super.create();

        this.cameras.main.setBackgroundColor(0x000000);
        
        this.background = this.add.image(0, 0, 'background').setOrigin(0, 0);
        Align.scaleToGameWidth(this.background, 1, this);

        this.input.once('pointerdown', () => {

            this.scene.start('Game');

        });
    }
}
