import { EndAction, NPCEvent, OverlapAction } from "../events/dialog";

export class NPCEventData
{
    npc: NPCEvent[];
}

export const npcEvents: { [key: string]: NPCEventData; } =
{
    "jared":
    {
        npc: [
                {
                    instance: 'jared0',
                    events: [
                        {
                            eventKey: 0,
                            dialog: [
                                "Hiya Love",
                                "I love you"
                            ],
                            onEnd: EndAction.incrementEvent,
                            overlapAction: OverlapAction.nop

                        },
                        {
                            eventKey: 0,
                            dialog: [
                                "Hiya Love",
                                "I love you"
                            ],
                            onEnd: EndAction.incrementEvent,
                            overlapAction: OverlapAction.nop
                        },
                    ]
                }
            ]
    }
};