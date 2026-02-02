import { EndAction, NPCEventEndAction, NPCEvent, OverlapAction, EventEndAction } from "../events/dialog";

export class NPCEndConfig
{
    fadeDuration: number;
}

export class EventEndConfig
{
    eventEndKey: number;
    spawnLocationNPCInstance?: string;


    tilesToRemove?: {layerName: string, coordinates: {x: number, y: number}[] }[];
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
                                "I knew you'd know the real me."
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
    },
    "maze": 
    {
        npcOnEnd: NPCEventEndAction.fadeOut,
        npcOnEndConfig: 
        {
            fadeDuration: 2000,
        },
        eventOnEnd: EventEndAction.spawnLunaMothButterfly | EventEndAction.removeTiles,
        eventEndConfig: 
        {
            eventEndKey: 1,
            spawnLocationNPCInstance: 'jaredmaze',
            tilesToRemove: [{layerName: 'colliders', coordinates: [{x: 42, y: 2}, {x: 43, y: 2}, {x: 44, y: 2}, {x: 42, y: 3}, {x: 43, y: 3}, {x: 44, y: 3}]}]
        },
        npc: [
            {
                    instance: 'jaredmaze',
                    events: [
                        {
                            eventKey: 0,
                            dialog: [
                                "You made it through the maze! Now let's just go behind this bush..."
                            ],
                            onEnd: EndAction.incrementEvent,
                            overlapAction: OverlapAction.nop
                        }
                    ]
            },
        ]
    }
};