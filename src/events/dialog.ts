export enum EndAction
{
    nop = "nop",

    incrementEvent = "incrementEvent",

    startScene = "startScene",

    spawnBirdwingButterfly = "spawnBirdwingButterfly",
    spawnHairstreakButterfly = "spawnHairstreakButterfly",
    spawnLunaMothButterfly = "spawnLunaMothButterfly",
    spawnPerianderButterfly = "spawnPerianderButterfly",

    grantItem = "grantItem",

    clearItem = "clearItem"
}


export enum OverlapAction 
{
    nop = "nop",

    autoTrigger = "autoTrigger",

    stop = "stop"
}

export enum EventEndAction
{
    nop = 0,
    spawnBirdwingButterfly = 1,
    spawnHairstreakButterfly = 2,
    spawnLunaMothButterfly = 4,
    spawnPerianderButterfly = 8,
    removeTiles = 16
}

export enum NPCEventEndAction
{
    nop = "nop",
    fadeOut = "fadeOut"
}

export class NPCEventDialog
{
    eventKey: number = 0;

    dialog: string[] = [];

    onEnd: EndAction = EndAction.nop;

    scene?: string;

    fromX?: number = 0;
    fromY?: number = 0;

    item?: string;

    overlapAction: OverlapAction = OverlapAction.nop;
}

export class NPCEvent
{
    instance: string;
    events: NPCEventDialog[];
}

export class NPCEventUtility 
{
    static findEventByKey(CharacterEvent: NPCEvent, key: number) : NPCEventDialog | undefined
    {
        return CharacterEvent.events.find((e) => {
            return e.eventKey == key;
        });
    }
}