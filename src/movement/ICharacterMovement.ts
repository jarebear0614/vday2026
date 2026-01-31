import { Types } from "phaser";
import { NPC } from "../character/NPC";

export interface ICharacterMovement 
{
    pause() : void;
    unpause() : void;
    
    setNPC(name: string, character: NPC) : void;
    update(delta: number) : void;
}