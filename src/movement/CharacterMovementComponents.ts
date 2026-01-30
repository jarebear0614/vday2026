import { Types } from "phaser";
import { ICharacterMovement } from"./ICharacterMovement"

export class NopCharacterMovement implements ICharacterMovement
{
    pause(): void 
    {
        
    }

    unpause(): void 
    {
        
    }

    setCharacter(_: string, __: Types.Physics.Arcade.SpriteWithDynamicBody): void {
        
    }

    update(_: number): void 
    {
        
    }    
}


export class RandomInRadiusCharacterMovement implements ICharacterMovement
{
    private name: string;
    private character: Types.Physics.Arcade.SpriteWithDynamicBody;
    private direction: string = 'down';

    private xCenter: number = 0;
    private yCenter: number = 0;
    private radius: number = 0;

    private start: Phaser.Math.Vector2 = Phaser.Math.Vector2.ZERO;

    private currentWaitTime = 0;
    private waitUntil = 0;
    private waitTimeRange = {min: 500, max: 1500};

    private isMoving: boolean = false;
    private destination: Phaser.Math.Vector2 = Phaser.Math.Vector2.ZERO;

    private velocity: number = 128;

    private isPaused: boolean = false;

    private lastDistance: number = 0;

    constructor(xCenter: number, yCenter: number, radius: number)
    {
        this.xCenter = xCenter;
        this.yCenter = yCenter;
        this.radius = radius;

        this.waitUntil = Math.round(Math.random() * this.waitTimeRange.max - this.waitTimeRange.min) + this.waitTimeRange.min;

        this.start = new Phaser.Math.Vector2(this.xCenter, this.yCenter);

        this.destination = new Phaser.Math.Vector2(this.xCenter, this.yCenter);
    }
    
    pause(): void 
    {
        this.isPaused = true;
        this.character.setVelocity(0, 0);
    }

    unpause(): void 
    {
        this.isPaused = false;

        let v = new Phaser.Math.Vector2(this.destination.x, this.destination.y).subtract(this.start).normalize().scale(this.velocity);
        this.character.setVelocity(v.x, v.y);
    }

    setCharacter(name: string, character: Types.Physics.Arcade.SpriteWithDynamicBody): void 
    {
        this.name = name;
        this.character = character;
    }

    update(delta: number): void 
    {
        if(!this.character || this.isPaused)
        {
            return;
        }

        if(this.isMoving)
        {
            let currentDistance = this.destination.distance(new Phaser.Math.Vector2(this.character.x, this.character.y));
            if(currentDistance > this.lastDistance)
            {
                let v = new Phaser.Math.Vector2(this.destination.x, this.destination.y).subtract(new Phaser.Math.Vector2(this.character.x, this.character.y)).normalize().scale(this.velocity);
                this.character.setVelocity(v.x, v.y);
            }

            if(this.destination.distance(new Phaser.Math.Vector2(this.character.x, this.character.y)) <= 5)
            {
                this.isMoving = false;
                this.waitUntil = Math.round(Math.random() * this.waitTimeRange.max - this.waitTimeRange.min) + this.waitTimeRange.min;
                this.character.setVelocity(0, 0);
                this.character.play(this.name.toLowerCase() + "_idle_" + this.direction);
            }
        }
        else 
        {
            this.currentWaitTime += delta;
            if(this.currentWaitTime >= this.waitUntil)
            {
                this.currentWaitTime = 0;
                this.isMoving = true;     
           
                this.start = new Phaser.Math.Vector2(this.destination.x, this.destination.y);
                
                this.destination.x = Math.round(Math.random() * this.radius * 2) + this.xCenter - this.radius;
                this.destination.y = Math.round(Math.random() * this.radius * 2) + this.yCenter - this.radius;

                let v = new Phaser.Math.Vector2(this.destination.x, this.destination.y).subtract(this.start).normalize().scale(this.velocity);

                if(v.x > 0 && v.x > Math.abs(v.y))
                {
                    this.direction = "right";
                }
                else if(v.x < 0 && Math.abs(v.x) > Math.abs(v.y))
                {
                    this.direction = "left";
                }
                else if(v.y > 0)
                {
                    this.direction = "down";
                }
                else if(v.y < 0)
                {
                    this.direction = "up";
                }
                else
                {
                    this.direction = "down";
                }

                this.character.play(this.name.toLowerCase() + "_walk_" + this.direction);


                this.character.setVelocity(v.x, v.y);

                this.lastDistance = this.destination.distance(new Phaser.Math.Vector2(this.character.x, this.character.y));
            }
        }
    }
}

export class CharacterMovementConfig 
{
    type: string = '';

    loop: boolean;
    waypoints: Phaser.Math.Vector2[];

    radius: number = 5;
}

export class WaypointCharacterMovement implements ICharacterMovement
{
    private character: Types.Physics.Arcade.SpriteWithDynamicBody;
    private name: string;
    private direction: string = 'down';

    private loop: boolean = false;
    private waypoints: Phaser.Math.Vector2[] = [];

    private scale: number = 1.0;

    private waypointIndex = 0;

    private start: Phaser.Math.Vector2 = Phaser.Math.Vector2.ZERO;
    private destination: Phaser.Math.Vector2 = Phaser.Math.Vector2.ZERO;

    private currentWaitTime = 0;
    private waitUntil = 0;
    private waitTimeRange = {min: 500, max: 1500};

    private isMoving: boolean = false;

    private velocity: number = 128;

    private isPaused: boolean = false;

    private lastDistance: number = 0;

    constructor(xCenter: number, yCenter: number, scale: number, config: CharacterMovementConfig)
    {
        this.waypoints = config.waypoints;
        this.loop = config.loop;
        this.scale = scale;

        this.destination = this.waypoints[0];

        this.start = new Phaser.Math.Vector2(xCenter, yCenter);
        this.destination = new Phaser.Math.Vector2(xCenter, yCenter);
    }
    
    pause(): void 
    {
        this.isPaused = true;
        this.character.setVelocity(0, 0);
    }

    unpause(): void 
    {
        this.isPaused = false;
        let v = new Phaser.Math.Vector2(this.destination.x, this.destination.y).subtract(this.start).normalize().scale(this.velocity);
        this.character.setVelocity(v.x, v.y);
    }

    setCharacter(name: string, character: Types.Physics.Arcade.SpriteWithDynamicBody): void 
    {
        this.name = name;
        this.character = character;
    }

    update(delta: number): void 
    {
        if(!this.character || this.isPaused)
        {
            return;
        }
        
        if(this.isMoving)
        {
            let currentDistance = this.destination.distance(new Phaser.Math.Vector2(this.character.x, this.character.y));
            if(currentDistance > this.lastDistance)
            {
                let v = new Phaser.Math.Vector2(this.destination.x, this.destination.y).subtract(new Phaser.Math.Vector2(this.character.x, this.character.y)).normalize().scale(this.velocity);
                this.character.setVelocity(v.x, v.y);
            }

            if(currentDistance <= 5)
            {
                this.isMoving = false;
                this.waitUntil = Math.round(Math.random() * this.waitTimeRange.max - this.waitTimeRange.min) + this.waitTimeRange.min;
                this.waypointIndex = (this.waypointIndex + 1) % this.waypoints.length;
                this.character.setVelocity(0, 0);
                this.character.play(this.name.toLowerCase() + "_idle_" + this.direction);

                if(this.waypointIndex == 0 && !this.loop)
                {
                    this.waitUntil = Number.MAX_SAFE_INTEGER;
                }
            }
        } else {
            this.currentWaitTime += delta;
            if(this.currentWaitTime >= this.waitUntil)
            {
                this.currentWaitTime = 0;
                this.isMoving = true;

                this.start = new Phaser.Math.Vector2(this.destination.x, this.destination.y);
                this.destination = new Phaser.Math.Vector2(
                    this.waypoints[this.waypointIndex].x * (16 * this.scale), 
                    this.waypoints[this.waypointIndex].y * (16 * this.scale));

                let v = new Phaser.Math.Vector2(this.destination.x, this.destination.y).subtract(this.start).normalize().scale(this.velocity);

                if(v.x > 0 && v.x > Math.abs(v.y))
                {
                    this.direction = "right";
                }
                else if(v.x < 0 && Math.abs(v.x) > Math.abs(v.y))
                {
                    this.direction = "left";
                }
                else if(v.y > 0)
                {
                    this.direction = "down";
                }
                else if(v.y < 0)
                {
                    this.direction = "up";
                }
                else
                {
                    this.direction = "down";
                }

                this.character.play(this.name.toLowerCase() + "_walk_" + this.direction);

                this.character.setVelocity(v.x, v.y);

                this.lastDistance = this.destination.distance(new Phaser.Math.Vector2(this.character.x, this.character.y));
            }
        }
    }    
}