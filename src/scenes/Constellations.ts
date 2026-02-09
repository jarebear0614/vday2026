import { GameState } from "../util/gameState";
import { BaseScene } from "./BaseScene";


export class Constellation
{
    startX: number = 0;
    startY: number = 0;
    width: number = 0;
    height: number = 0;
    points: Phaser.Math.Vector2[] = [];
    origin: Phaser.Math.Vector2;
}

export class Constellations extends BaseScene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    gameState: GameState = new GameState();

    constellations: Constellation[] = [];

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
            // {                
            //     startX: this.getGameWidth() / 2 - infinityWidth / 2,
            //     startY: this.getGameHeight() / 2,
            //     width: infinityWidth,
            //     height: infinityHeight,
            //     origin: new Phaser.Math.Vector2(0, 0.5),
            //     points: 
            //     [
            //         new Phaser.Math.Vector2(0, 0),
            //         new Phaser.Math.Vector2(infinityWidth * (1.25/5), -infinityHeight * 0.5),
            //         new Phaser.Math.Vector2(infinityWidth * (2.5/5), 0),
            //         new Phaser.Math.Vector2(infinityWidth * (3.75/5), infinityHeight * 0.5),
            //         new Phaser.Math.Vector2(infinityWidth * (5/5), 0),
            //         new Phaser.Math.Vector2(infinityWidth * (3.75/5), -infinityHeight * 0.5),
            //         new Phaser.Math.Vector2(infinityWidth * (2.5/5), 0),
            //         new Phaser.Math.Vector2(infinityWidth * (1.25/5), infinityHeight * 0.5),
            //         new Phaser.Math.Vector2(0, 0),
            //     ]
            // },
            // {
            //     startX: this.getGameWidth() / 2 - piWidth / 2,
            //     startY: this.getGameHeight() / 2 - piHeight / 2,
            //     width: piWidth,
            //     height: piHeight,
            //     origin: new Phaser.Math.Vector2(0, 0),
            //     points:
            //     [
            //         new Phaser.Math.Vector2(0, 0),
            //         new Phaser.Math.Vector2(piWidth * (1.25/5), 0),
            //         new Phaser.Math.Vector2(piWidth * (1.25/5), piHeight),
            //         new Phaser.Math.Vector2(piWidth * (1.25/5), 0),
            //         new Phaser.Math.Vector2(piWidth * (4/5), 0),
            //         new Phaser.Math.Vector2(piWidth * (4/5), piHeight),
            //         new Phaser.Math.Vector2(piWidth * (4/5), 0),
            //         new Phaser.Math.Vector2(piWidth, 0),
            //     ]
            // },
            {
                startX: this.getGameWidth() / 2 - twoWidth / 2,
                startY: this.getGameHeight() / 2 - twoHeight / 2,
                width: twoWidth,
                height: twoHeight,
                origin: new Phaser.Math.Vector2(0, 0),
                points:
                [
                    new Phaser.Math.Vector2(0, twoHeight * (1/3)),
                    new Phaser.Math.Vector2(twoWidth * 0.5, 0),
                    new Phaser.Math.Vector2(twoWidth, twoHeight * (1/3)),
                    new Phaser.Math.Vector2(0, twoHeight),
                    new Phaser.Math.Vector2(twoWidth, twoHeight),
                ]
            }
        ]

        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0xff00ff);

        for(let constellation of this.constellations)
        {
            let startX = constellation.startX;
            let startY = constellation.startY;

            this.add.rectangle(startX, startY, constellation.width, constellation.height, 0xff0000, 0.4).setOrigin(constellation.origin.x, constellation.origin.y);

            let currentPoint: Phaser.Math.Vector2 = constellation.points[0];
            for(let i = 0; i < constellation.points.length; ++i)
            {
                let point = constellation.points[i];

                if(i > 0)
                {
                    this.add.line(startX + currentPoint.x, startY + currentPoint.y, 0, 0, point.x - currentPoint.x, point.y - currentPoint.y, 0xffffff, 1.0).setOrigin(0, 0);
                }

                currentPoint = point;
            }

            //this.add.line(startX + currentPoint.x, startY + currentPoint.y, 0, 0, constellation.points[0].x - currentPoint.x, constellation.points[0].y - currentPoint.y, 0xffffff, 1.0).setOrigin(0, 0);
        }
        
    }

    update()
    {

    }
}