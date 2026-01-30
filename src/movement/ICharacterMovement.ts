import { Types } from "phaser";

export interface ICharacterMovement 
{
    pause() : void;
    unpause() : void;
    
    setCharacter(name: string, character: Types.Physics.Arcade.SpriteWithDynamicBody) : void;
    update(delta: number) : void;
}