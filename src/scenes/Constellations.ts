import { GameObjects } from "phaser";
import { GameState } from "../util/gameState";
import { BaseScene } from "./BaseScene";
import { Align } from "../util/align";

export class ConstellationPoint
{
    aesthetic: boolean;
    completed: boolean;
    location: Phaser.Math.Vector2;
}

export class Constellation
{
    startX: number = 0;
    startY: number = 0;
    width: number = 0;
    height: number = 0;
    points: ConstellationPoint[] = [];
    origin: Phaser.Math.Vector2;
}

export class Constellations extends BaseScene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    gameState: GameState = new GameState();

    constellations: Constellation[] = [];
    constellationIndex: number = 0;

    currentText: GameObjects.Text;

    starPercentage: number = 0.08;
    starWidth: number = 32;
    starHeight: number = 32;

    currentZones: GameObjects.Zone[] = [];
    currentImages: GameObjects.Image[] = [];
    currentLines: GameObjects.Line[] = [];

    constructor()
    {
        super("Constellations");
    }

    init(data: any)
    {
        if(data && data.gameState && data.gameState instanceof GameState) 
        {
            this.gameState = data.gameState;
        }
    }

    preload()
    {
        this.load.image('star', 'assets/sprites/star.png');
    }

    create()
    {
        super.create();


        let infinityWidth = this.getGameWidth() * 0.6;
        let infinityHeight = this.getGameHeight() * 0.15;

        let piWidth = this.getGameWidth() * 0.65;
        let piHeight = this.getGameHeight() * 0.2;

        let twoWidth = this.getGameWidth() * 0.65;
        let twoHeight = this.getGameHeight() * 0.35;

        this.constellations = 
        [
            {                
                startX: this.getGameWidth() / 2 - infinityWidth / 2,
                startY: this.getGameHeight() / 2,
                width: infinityWidth,
                height: infinityHeight,
                origin: new Phaser.Math.Vector2(0, 0.5),
                points: 
                [
                    { aesthetic: false, completed: false, location: new Phaser.Math.Vector2(0, 0) },
                    { aesthetic: false, completed: true, location: new Phaser.Math.Vector2(infinityWidth * (1.25/5), -infinityHeight * 0.5) },
                    { aesthetic: false, completed: true, location: new Phaser.Math.Vector2(infinityWidth * (2.5/5), 0) },
                    { aesthetic: false, completed: true, location: new Phaser.Math.Vector2(infinityWidth * (3.75/5), infinityHeight * 0.5) },
                    { aesthetic: false, completed: false, location: new Phaser.Math.Vector2(infinityWidth * (5/5), 0) },
                    { aesthetic: false, completed: true, location: new Phaser.Math.Vector2(infinityWidth * (3.75/5), -infinityHeight * 0.5) },
                    { aesthetic: true, completed: true, location: new Phaser.Math.Vector2(infinityWidth * (2.5/5), 0) },
                    { aesthetic: false, completed: true, location: new Phaser.Math.Vector2(infinityWidth * (1.25/5), infinityHeight * 0.5) },
                    { aesthetic: true, completed: true, location: new Phaser.Math.Vector2(0, 0) },
                ]
            },
            {
                startX: this.getGameWidth() / 2 - piWidth / 2,
                startY: this.getGameHeight() / 2 - piHeight / 2,
                width: piWidth,
                height: piHeight,
                origin: new Phaser.Math.Vector2(0, 0),
                points:
                [
                    { aesthetic: false, completed: true, location: new Phaser.Math.Vector2(0, 0) },
                    { aesthetic: false, completed: false, location: new Phaser.Math.Vector2(piWidth * (1.25/5), 0) },
                    { aesthetic: false, completed: false, location: new Phaser.Math.Vector2(piWidth * (1.25/5), piHeight) },
                    { aesthetic: true, completed: true, location: new Phaser.Math.Vector2(piWidth * (1.25/5), 0) },
                    { aesthetic: false, completed: true, location: new Phaser.Math.Vector2(piWidth * (4/5), 0) },
                    { aesthetic: false, completed: false, location: new Phaser.Math.Vector2(piWidth * (4/5), piHeight) },
                    { aesthetic: true, completed: true, location: new Phaser.Math.Vector2(piWidth * (4/5), 0) },
                    { aesthetic: false, completed: false, location: new Phaser.Math.Vector2(piWidth, 0) },
                ]
            },
            {
                startX: this.getGameWidth() / 2 - twoWidth / 2,
                startY: this.getGameHeight() / 2 - twoHeight / 2,
                width: twoWidth,
                height: twoHeight,
                origin: new Phaser.Math.Vector2(0, 0),
                points:
                [
                    { aesthetic: false, completed: true, location: new Phaser.Math.Vector2(0, twoHeight * (1/3)) },
                    { aesthetic: false, completed: false, location: new Phaser.Math.Vector2(twoWidth * 0.5, 0) },
                    { aesthetic: false, completed: true, location: new Phaser.Math.Vector2(twoWidth, twoHeight * (1/3)) },
                    { aesthetic: false, completed: false, location: new Phaser.Math.Vector2(0, twoHeight) },
                    { aesthetic: false, completed: true, location: new Phaser.Math.Vector2(twoWidth, twoHeight) },
                ]
            }
        ]

        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x000000);
        
        this.firstStart();
    }

    firstStart()
    {
        this.currentText = this.add.text(0, 0, 'test', {fontFamily: 'Arial', fontSize: 24, color: '#ffffff'})
            .setStroke("#000000", 4)
            .setScrollFactor(0)
            .setAlpha(0.0)
            .setWordWrapWidth(this.getGameWidth() * 0.7)
            .setAlign('center');

        this.currentText.text = "Complete the constellations by tapping on the missing parts, love";

        this.currentText.x = this.getGameWidth() / 2 - this.currentText.displayWidth / 2;
        this.currentText.y = this.getGameHeight() / 2 - this.currentText.displayHeight / 2;

        let fadeInTween = this.tweens.add({
            targets: this.currentText,
            alpha: { from: 0, to: 1 },
            ease: 'Linear',
            duration: 1500,
            repeat: 0,
            yoyo: false
        });

        fadeInTween.onCompleteHandler = () =>
        {
            this.time.delayedCall(300, () => {

                this.tweens.killTweensOf(this.currentText);

                let fadeOutTween = this.tweens.add({
                    targets: this.currentText,
                    alpha: { from: this.currentText.alpha, to: 0 },
                    ease: 'Linear',
                    duration: 1500,
                    repeat: 0,
                    yoyo: false
                });

                fadeOutTween.onCompleteHandler = () =>
                {
                    this.tweens.killTweensOf(this.currentText);
                    this.startConstellation(this.constellationIndex);
                }
            })
        }
    }

    startConstellation(index: number)
    {
        let constellation = this.constellations[index];

        let startX = constellation.startX;
        let startY = constellation.startY;

        //this.add.rectangle(startX, startY, constellation.width, constellation.height, 0xff0000, 0.4).setOrigin(constellation.origin.x, constellation.origin.y);

        let currentPoint: Phaser.Math.Vector2 = constellation.points[0].location;
        for(let i = 0; i < constellation.points.length; ++i)
        {
            let point = constellation.points[i];

            if(!point.aesthetic && point.completed)
            {
                let img = this.add.image(startX + point.location.x, startY + point.location.y, 'star').setAlpha(0.0);
                Align.scaleToGameWidth(img, this.starPercentage, this);

                this.starWidth = img.displayWidth;
                this.starHeight = img.displayHeight;

                this.currentImages.push(img);
            }

            if(!point.aesthetic && !point.completed)
            {
                //this.add.rectangle(startX + point.location.x, startY + point.location.y, this.starWidth, this.starHeight, 0xff0000, 0.4);
                let zone = this.add.zone(startX + point.location.x, startY + point.location.y, this.starWidth, this.starHeight).setInteractive({ useHandCursor: true});
                let fn = () => 
                {
                    this.currentImages.push(this.add.image(startX + point.location.x, startY + point.location.y, 'star').setTint(0x00FF00));
                    point.completed = true;
                    zone.removeAllListeners();
                };

                zone.on('pointerup', fn)
                this.currentZones.push(zone);
            }

            if(i > 0)
            {
                this.currentLines.push(this.add.line(startX + currentPoint.x, startY + currentPoint.y, 0, 0, point.location.x - currentPoint.x, point.location.y - currentPoint.y, 0xffffff, 1.0).setOrigin(0, 0));
            }

            currentPoint = point.location;
        }        

        for(let img of this.currentImages)
        {
            let fadeInTween = this.tweens.add({
                targets: img,
                alpha: { from: 0, to: 1 },
                ease: 'Linear',
                duration: 1000,
                repeat: 0,
                yoyo: false
            });

            fadeInTween.onCompleteHandler = () => 
            {
                this.tweens.killTweensOf(img);
            }
        }
    }

    drawConstellation(index: number)
    {
        let constellation = this.constellations[index];

        let startX = constellation.startX;
        let startY = constellation.startY;

        //this.add.rectangle(startX, startY, constellation.width, constellation.height, 0xff0000, 0.4).setOrigin(constellation.origin.x, constellation.origin.y);

        let currentPoint: Phaser.Math.Vector2 = constellation.points[0].location;
        for(let i = 0; i < constellation.points.length; ++i)
        {
            let point = constellation.points[i];

            if(i > 0)
            {
                this.add.line(startX + currentPoint.x, startY + currentPoint.y, 0, 0, point.location.x - currentPoint.x, point.location.y - currentPoint.y, 0xffffff, 1.0).setOrigin(0, 0);
            }

            currentPoint = point.location;
        }
    }

    update()
    {
        if(this.constellationIndex >= this.constellations.length)
        {
            return;
        }

        let completed = this.constellations[this.constellationIndex].points.every((c) => {
            return c.completed;
        });

        if(completed)
        {
            this.constellationIndex++;

            for(let z of this.currentZones)
            {
                z.destroy();
            }

            for(let img of this.currentImages)
            {
                img.destroy();
            }

            for(let line of this.currentLines)
            {
                line.destroy();
            }

            this.currentZones.splice(0, this.currentZones.length);
            this.currentImages.splice(0, this.currentImages.length);
            this.currentLines.splice(0, this.currentLines.length);

            if(this.constellationIndex < this.constellations.length)
            {
                this.startConstellation(this.constellationIndex);
            }
            else
            {
                this.currentText.text = "(∞π)² <3";

                this.currentText.x = this.getGameWidth() / 2 - this.currentText.displayWidth / 2;
                this.currentText.y = this.getGameHeight() / 2 - this.currentText.displayHeight / 2;

                let fadeInTween = this.tweens.add({
                    targets: this.currentText,
                    alpha: { from: 0, to: 1 },
                    ease: 'Linear',
                    duration: 1500,
                    repeat: 0,
                    yoyo: false
                });

                fadeInTween.onCompleteHandler = () =>
                {
                    this.time.delayedCall(2000, () => {

                        this.tweens.killTweensOf(this.currentText);

                        let fadeOutTween = this.tweens.add({
                            targets: this.currentText,
                            alpha: { from: this.currentText.alpha, to: 0 },
                            ease: 'Linear',
                            duration: 1500,
                            repeat: 0,
                            yoyo: false
                        });

                        fadeOutTween.onCompleteHandler = () =>
                        {
                            this.tweens.killTweensOf(this.currentText);
                            
                            this.gameState.fromScene = "Constellations";
                            this.gameState.completedConstellations = true;
                            
                            this.scene.start('Game', this.gameState);
                        }
                    })
                }
            }            
        }
    }
}