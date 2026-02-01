import { EndAction, NPCEventEndAction, NPCEvent, OverlapAction, EventEndAction } from "../events/dialog";

export class NPCEndConfig
{
    fadeDuration: number;
}

export class EventEndConfig
{
    eventEndKey: number;
    spawnLocationNPCInstance?: string;
}

export class NPCEventData
{
    npcOnEndConfig?: NPCEndConfig;
    npcOnEnd: NPCEventEndAction = NPCEventEndAction.nop;
    eventOnEnd: EventEndAction = EventEndAction.nop;
    eventEndConfig?: EventEndConfig;
    npc: NPCEvent[];
}

export const npcEvents: { [key: string]: NPCEventData; } =
{
    "whatsreal":
    {
        npcOnEnd: NPCEventEndAction.fadeOut,
        npcOnEndConfig: 
        {
            fadeDuration: 2000,
        },
        eventOnEnd: EventEndAction.spawnBirdwingButterfly,
        eventEndConfig: 
        {
            eventEndKey: 1,
            spawnLocationNPCInstance: 'jared0'
        },
        npc: [
                {
                    instance: 'jared0',
                    events: [
                        {
                            eventKey: 0,
                            dialog: [
                                "Hiya Love",
                                "You found me"
                            ],
                            onEnd: EndAction.incrementEvent,
                            overlapAction: OverlapAction.nop
                        }
                    ]
                },
                {
                    instance: 'jaredfake0',
                    events: [
                        {
                            eventKey: 0,
                            dialog: [
                                "Tee hee"
                            ],
                            onEnd: EndAction.nop,
                            overlapAction: OverlapAction.nop
                        },
                    ]
                },
                {
                    instance: 'jaredfake1',
                    events: [
                        {
                            eventKey: 0,
                            dialog: [
                                "Tee hee"
                            ],
                            onEnd: EndAction.nop,
                            overlapAction: OverlapAction.nop
                        },
                    ]
                },
                {
                    instance: 'jaredfake2',
                    events: [
                        {
                            eventKey: 0,
                            dialog: [
                                "Tee hee"
                            ],
                            onEnd: EndAction.nop,
                            overlapAction: OverlapAction.nop
                        },
                    ]
                }
            ]
    }
};