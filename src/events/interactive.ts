import { NPC } from "../character/NPC";
import { EndAction, NPCEvent } from "./dialog";

export class InteractiveConfig
{
    title?: string;
    endAction?: EndAction = EndAction.nop;
    sourceCharacter?: NPC;
    sceneTransition?: SceneTransitionConfig;
    sourceDialog?: NPCEvent;
    eventName?: string;
    grantedItem?: string;
    sourceTriggerEventData?: {name: string, data: any}
}

export class InteractiveTriggerConfig
{
    type: string;

    scene?: SceneTransitionConfig;

    interactive?: Interactive | null;
}

export class SceneTransitionConfig
{
    toScene: string;
    fromX: number;
    fromY: number;
}

export class Interactive 
{
    type: string;
    messages: string[] = [];
    eventName?: string;
    eventKeyTrigger?: number;
    title?: string = undefined;
    endAction: EndAction = EndAction.nop;
    sourceCharacter?: NPC;
    sceneTransition?: SceneTransitionConfig;
    grantedItem?: string;
    eventTriggerData?: {name: string, data: any};

    constructor(messages: string[], type: string, eventName?: string, eventKeyTrigger?: number, config?: InteractiveConfig) 
    {
        this.type = type;
        this.messages = messages;
        this.eventName = eventName;
        this.eventKeyTrigger = eventKeyTrigger;
        this.title = config?.title;
        this.endAction = config?.endAction ?? EndAction.nop;
        this.sourceCharacter = config?.sourceCharacter;
        this.sceneTransition = config?.sceneTransition;
        this.grantedItem = config?.grantedItem;
        this.eventTriggerData = config?.sourceTriggerEventData;
    }
}