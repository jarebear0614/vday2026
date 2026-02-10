import { Types } from "phaser";
import { ICharacterMovement } from"./ICharacterMovement"
import { NPC } from "../character/NPC";

export class NopCharacterMovement implements ICharacterMovement
{
    pause(): void 
    {
        
    }

    unpause(): void 
    {
        
    }

    setNPC(_: string, __: NPC): void {
        
    }

    update(_: number): void 
    {
        
    }    
}

export class MoveHorizontallyCharacterMovement implements ICharacterMovement
{
    private name: string;
    private npc: NPC;
    private isPaused: boolean = false;

    private xCenter: number = 0;
    private yCenter: number = 0;
    private distance: number = 0;
    private velocity: number = 0;
    private isMoving: boolean = false;

    private destination: Phaser.Math.Vector2 = Phaser.Math.Vector2.ZERO;
    private reachedDesination: boolean = false;

    onCompleteHandler: ((npc: NPC) => void) | undefined;

    constructor(xCenter: number, yCenter: number, distance: number, velocity: number = 128)
    {
        this.xCenter = xCenter;
        this.yCenter = yCenter;
        this.distance = distance;
        this.velocity = velocity;

        this.destination = new Phaser.Math.Vector2(this.xCenter + this.distance, this.yCenter);
    }

    setDestinationDistance(distance: number)
    {
        this.distance = distance;
        this.destination = new Phaser.Math.Vector2(this.npc.body.x + distance, this.yCenter);
        this.isMoving = false;
        this.reachedDesination = false;
    }

    setVelocity(velocity: number)
    {
        this.velocity = velocity;
    }

    pause(): void 
    {
        if(this.npc.destroyed || !this.npc.created || this.isPaused)
        {
            return;
        }
        
        this.isPaused = true;
        this.npc.body.setVelocity(0, 0);
        this.npc.body.play(this.name.toLowerCase() + "_idle_right", true);
    }

    unpause(): void 
    {
        if(this.npc.destroyed || !this.npc.created || !this.isPaused)
        {
            return;
        }

        this.isPaused = false;

        let v = new Phaser.Math.Vector2(this.destination.x, this.destination.y).subtract(new Phaser.Math.Vector2(this.npc.body.x, this.npc.body.y)).normalize().scale(this.velocity);
        this.npc.body.setVelocity(v.x, v.y);

        this.npc.body.play(this.name.toLowerCase() + "_walk_right", true);
    }

    setNPC(name: string, npc: NPC): void 
    {
        this.name = name;
        this.npc = npc;
    }

    update(delta: number): void 
    {
        if(!this.npc || this.npc.destroyed || this.isPaused)
        {
            return;
        }

        if(this.isMoving)
        {
            if(this.destination.distance(new Phaser.Math.Vector2(this.npc.body.x, this.npc.body.y)) <= 5)
            {
                this.isMoving = false;
                this.npc.body.setVelocity(0, 0);
                this.npc.body.setPosition(this.destination.x, this.destination.y);
                this.npc.body.play(this.name.toLowerCase() + "_idle_right");
                this.reachedDesination = true;

                if(this.onCompleteHandler)
                {
                    this.onCompleteHandler(this.npc);
                }
            }
        } 
        else 
        {
            if(!this.reachedDesination)
            {
                this.isMoving = true;
                let v = new Phaser.Math.Vector2(this.destination.x, this.destination.y).subtract(new Phaser.Math.Vector2(this.npc.body.x, this.npc.body.y)).normalize().scale(this.velocity);
                this.npc.body.setVelocity(v.x, v.y);

                if(this.distance < 0)
                {
                    this.npc.body.play(this.name.toLowerCase() + "_walk_left");
                }
                else
                {
                    this.npc.body.play(this.name.toLowerCase() + "_walk_right");   
                }
            }
        }
    }    
}

export class RandomInRadiusCharacterMovement implements ICharacterMovement
{
    private name: string;
    private npc: NPC;
    private direction: string = 'down';

    private xCenter: number = 0;
    private yCenter: number = 0;
    private radius: number = 0;

    private start: Phaser.Math.Vector2 = Phaser.Math.Vector2.ZERO;

    private currentWaitTime = 0;
    private waitUntil = 0;
    private waitTimeRange = {min: 500, max: 1500};
    private waitBetween: number | undefined = undefined;

    private isMoving: boolean = false;
    private destination: Phaser.Math.Vector2 = Phaser.Math.Vector2.ZERO;

    private velocity: number = 128;

    private isPaused: boolean = false;

    private lastDistance: number = 0;

    constructor(xCenter: number, yCenter: number, radius: number, waitBetween?: number)
    {
        this.xCenter = xCenter;
        this.yCenter = yCenter;
        this.radius = radius;
        this.waitBetween = waitBetween;

        this.waitUntil = Math.round(Math.random() * this.waitTimeRange.max - this.waitTimeRange.min) + this.waitTimeRange.min;

        this.start = new Phaser.Math.Vector2(this.xCenter, this.yCenter);

        this.destination = new Phaser.Math.Vector2(this.xCenter, this.yCenter);
    }
    
    pause(): void 
    {
        if(this.npc.destroyed || !this.npc.created || this.isPaused)
        {
            return;
        }
        
        this.isPaused = true;
        this.npc.body.setVelocity(0, 0);
        this.npc.body.play(this.name.toLowerCase() + "_idle_" + this.direction, true);
    }

    unpause(): void 
    {
        if(this.npc.destroyed || !this.npc.created || !this.isPaused)
        {
            return;
        }

        this.isPaused = false;

        let v = new Phaser.Math.Vector2(this.destination.x, this.destination.y).subtract(new Phaser.Math.Vector2(this.npc.body.x, this.npc.body.y)).normalize().scale(this.velocity);
        this.npc.body.setVelocity(v.x, v.y);

        this.npc.body.play(this.name.toLowerCase() + "_walk_" + this.direction, true);
    }

    setNPC(name: string, npc: NPC): void 
    {
        this.name = name;
        this.npc = npc;
    }

    update(delta: number): void 
    {
        if(!this.npc || this.isPaused)
        {
            return;
        }

        if(this.isMoving)
        {
            let currentDistance = this.destination.distance(new Phaser.Math.Vector2(this.npc.body.x, this.npc.body.y));
            if(currentDistance > this.lastDistance)
            {
                let v = new Phaser.Math.Vector2(this.destination.x, this.destination.y).subtract(new Phaser.Math.Vector2(this.npc.body.x, this.npc.body.y)).normalize().scale(this.velocity);
                this.npc.body.setVelocity(v.x, v.y);
            }

            if(this.destination.distance(new Phaser.Math.Vector2(this.npc.body.x, this.npc.body.y)) <= 5)
            {
                this.isMoving = false;
                this.waitUntil = this.waitBetween ? this.waitBetween : Math.round(Math.random() * this.waitTimeRange.max - this.waitTimeRange.min) + this.waitTimeRange.min;
                this.npc.body.setVelocity(0, 0);
                this.npc.body.play(this.name.toLowerCase() + "_idle_" + this.direction);
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

                this.npc.body.play(this.name.toLowerCase() + "_walk_" + this.direction);


                this.npc.body.setVelocity(v.x, v.y);

                this.lastDistance = this.destination.distance(new Phaser.Math.Vector2(this.npc.body.x, this.npc.body.y));
            }
        }
    }
}

export class NPCMovementConfig 
{
    type: string = '';

    loop: boolean;
    waypoints: Phaser.Math.Vector2[];

    waitBetween: number | undefined = undefined;

    radius: number = 5;
}

export class WaypointCharacterMovement implements ICharacterMovement
{
    private npc: NPC;
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
    private waitBetween: number | undefined = undefined;
    private waitTimeRange = {min: 500, max: 1500};

    private isMoving: boolean = false;

    private velocity: number = 128;

    private isPaused: boolean = false;

    private lastDistance: number = 0;

    constructor(xCenter: number, yCenter: number, scale: number, config: NPCMovementConfig)
    {
        this.waypoints = config.waypoints;
        this.loop = config.loop;
        this.scale = scale;

        this.destination = this.waypoints[0];

        this.waitBetween = config.waitBetween;

        this.start = new Phaser.Math.Vector2(xCenter, yCenter);
        this.destination = new Phaser.Math.Vector2(xCenter, yCenter);
    }
    
    pause(): void 
    {
        if(this.npc.destroyed || !this.npc.created || this.isPaused)
        {
            return;
        }

        this.isPaused = true;
        this.npc.body.setVelocity(0, 0);
        this.npc.body.play(this.name.toLowerCase() + "_idle_" + this.direction, true);
    }

    unpause(): void 
    {
        if(this.npc.destroyed || !this.npc.created || !this.isPaused)
        {
            return;
        }
        
        this.isPaused = false;
        let v = new Phaser.Math.Vector2(this.destination.x, this.destination.y).subtract(new Phaser.Math.Vector2(this.npc.body.x, this.npc.body.y)).normalize().scale(this.velocity);
        this.npc.body.setVelocity(v.x, v.y);
        this.npc.body.play(this.name.toLowerCase() + "_walk_" + this.direction, true);
    }

    setNPC(name: string, npc: NPC): void 
    {
        this.name = name;
        this.npc = npc;
    }

    update(delta: number): void 
    {
        if(!this.npc || this.isPaused || this.npc.destroyed || !this.npc.created)
        {
            return;
        }
        
        if(this.isMoving)
        {
            let currentDistance = this.destination.distance(new Phaser.Math.Vector2(this.npc.body.x, this.npc.body.y));
            if(currentDistance > this.lastDistance)
            {
                let v = new Phaser.Math.Vector2(this.destination.x, this.destination.y).subtract(new Phaser.Math.Vector2(this.npc.body.x, this.npc.body.y)).normalize().scale(this.velocity);
                this.npc.body.setVelocity(v.x, v.y);
            }

            if(currentDistance <= 5)
            {
                this.isMoving = false;
                this.waitUntil = this.waitBetween ? this.waitBetween : Math.round(Math.random() * this.waitTimeRange.max - this.waitTimeRange.min) + this.waitTimeRange.min;
                this.waypointIndex = (this.waypointIndex + 1) % this.waypoints.length;
                this.npc.body.setVelocity(0, 0);
                this.npc.body.play(this.name.toLowerCase() + "_idle_" + this.direction);

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

                this.npc.body.play(this.name.toLowerCase() + "_walk_" + this.direction);

                this.npc.body.setVelocity(v.x, v.y);

                this.lastDistance = this.destination.distance(new Phaser.Math.Vector2(this.npc.body.x, this.npc.body.y));
            }
        }
    }    
}