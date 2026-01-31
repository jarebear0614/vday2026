export enum EndAction
{
    nop = "nop",

    incrementEvent = "incrementEvent",

    startScene = "startScene",

    giveLyricPiece = "giveLyricPiece",

    grantItem = "grantItem",

    clearItem = "clearItem"
}


export enum OverlapAction 
{
    nop = "nop",

    autoTrigger = "autoTrigger"
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