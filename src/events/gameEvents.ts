import { NPC } from "../character/NPC";
import { EventEndConfig, NPCEndConfig } from "../util/events";
import { EventEndAction, NPCEventEndAction } from "./dialog";

export const EVENT_KEY_MAX: number = 1000000;

export class EndEventsConfig
{
    onNpcEnd: NPCEventEndAction = NPCEventEndAction.nop;
    npcEndConfig?: NPCEndConfig;
    eventEnd: EventEndAction = EventEndAction.nop;
    eventEndConfig?: EventEndConfig;

    constructor(onNpcEnd: NPCEventEndAction = NPCEventEndAction.nop, npcEndConfig?: NPCEndConfig, eventEnd: EventEndAction = EventEndAction.nop, eventEndConfig?: EventEndConfig)
    {
        this.onNpcEnd = onNpcEnd;
        this.npcEndConfig = npcEndConfig;
        this.eventEnd = eventEnd;
        this.eventEndConfig = eventEndConfig;
    }
}

export class GameEventDeactivationInformation
{
    npcs: NPC[] = [];
    onNpcEnd: NPCEventEndAction = NPCEventEndAction.nop;
    npcEndConfig?: NPCEndConfig;
    eventEndConfig?: EventEndConfig;
    eventEndAction: EventEndAction;
    isEventEnding: boolean = false;
    callback: () => void;

    constructor(isEventEnding: boolean, eventEndAction: EventEndAction, npcs: NPC[], onNpcEnd: NPCEventEndAction, callback: () => void, npcEndConfig?: NPCEndConfig, eventEndConfig?: EventEndConfig)
    {
        this.isEventEnding = isEventEnding;
        this.eventEndAction = eventEndAction;
        this.npcs = npcs;
        this.onNpcEnd = onNpcEnd;
        this.callback = callback;
        this.npcEndConfig = npcEndConfig;
        this.eventEndConfig = eventEndConfig;
    }
}

export class GameEvent
{
    name: string;
    key: number = 0;
    npcs: NPC[] = [];    
    endEventsConfig?: EndEventsConfig;

    constructor(name: string, key: number, characters?: NPC[], endEventsConfig?: EndEventsConfig)
    {
        this.name = name;
        this.key = key;
        this.npcs = characters ?? [];
        this.endEventsConfig = endEventsConfig;
    }

    activate() 
    {
        for(let npc of this.npcs)
        {            
            if(this.key >= npc.getEventKeyTrigger() && this.key < (npc.getEventKeyEnd() ?? EVENT_KEY_MAX) && !npc.isCreated())
            {
                npc.create();
            }
        }
    }

    deactivate() : GameEventDeactivationInformation
    {
        let npcs: NPC[] = [];
        
        for(let npc of this.npcs)
        {
            //key + 1 because we assume on deactivate we're at the next event
            if(npc.isCreated() && this.key + 1 >= (npc.getEventKeyEnd() ?? EVENT_KEY_MAX))
            {
                npcs.push(npc);

                if(this.endEventsConfig?.onNpcEnd == NPCEventEndAction.nop)
                {
                    npc.tearDown();
                }
            }
        }

        return new GameEventDeactivationInformation(this.key + 1 >= (this.endEventsConfig?.eventEndConfig?.eventEndKey ?? EVENT_KEY_MAX), this.endEventsConfig?.eventEnd ?? EventEndAction.nop, npcs, this.endEventsConfig?.onNpcEnd ?? NPCEventEndAction.nop, () =>
        {
            for(let npc of npcs)
            {
                npc.tearDown();
            }
        }, this.endEventsConfig?.npcEndConfig, this.endEventsConfig?.eventEndConfig);
    }

    update(delta: number)
    {
        for(let character of this.npcs)
        {
            if(character.isCreated())
            {
                character.update(delta);
            }
        }
    }
}

export class GameEvents
{
    [key: string]: GameEvent[];
}

export class GameEventProgress
{
    [key: string]: number;
}

export class GameEventManager
{
    gameEvents: GameEvents = {};
    gameEventProgress: GameEventProgress = {};

    addEvent(name: string, eventKey: number, npcs?: NPC[], endEventsConfig?: EndEventsConfig)
    {
        if(!this.gameEvents[name])
        {
            this.gameEvents[name] = [];
        }

        if(!this.gameEventProgress[name])
        {
            this.gameEventProgress[name] = 0;
        }

        let existingEvent = this.findEventByNameAndKey(name, eventKey);

        if(existingEvent)
        {
            if(npcs)
            {
                for(let npc of npcs)
                {
                    let existingCharacter = existingEvent.npcs.find((c) => {return c.instance == npc.instance});
                    if(!existingCharacter)
                    {
                        existingEvent.npcs.push(npc);
                    }
                }                
            }            
        }
        else
        {
            this.gameEvents[name].push(new GameEvent(name, eventKey, npcs, endEventsConfig));
        }
    }

    incrementEvent(name: string) : GameEventDeactivationInformation | undefined
    {
        let currentEvent = this.getCurrentEvent(name);
        let deactivateInfo = currentEvent?.deactivate();

        if(this.gameEventProgress.hasOwnProperty(name))
        {
            this.gameEventProgress[name]++;
        }

        return deactivateInfo;
    }

    findEventByNameAndKey(name: string, key: number) : GameEvent | undefined
    {
        if(!this.gameEvents[name])
        {
            return undefined;
        }

        return this.gameEvents[name].find((ev) => {
            return ev.name == name && ev.key == key;
        });
    }

    getCurrentEventProgress(name: string): number
    {
        return this.gameEventProgress[name] ?? 0;
    }

    getCurrentEvent(name: string) : GameEvent | undefined
    {
        let progress = this.gameEventProgress[name];
        return this.gameEvents[name].find((ev) =>
        {
            return ev.key == progress;
        });
    }

    getCurrentGameEvents() : GameEvent[]
    {
        let names = Object.keys(this.gameEvents);
        let events: GameEvent[] = [];

        for(let name of names)
        {            
            if(this.gameEventProgress.hasOwnProperty(name))
            {
                let found = this.getCurrentEventForName(name, this.gameEventProgress[name]);
                if(found)
                {
                    events.push(found);
                }
            }
        }

        return events;
    }

    activateCurrentEvents()
    {
        let events = this.getCurrentGameEvents();

        for(let ev of events)
        {
            ev.activate();
        }
    }

    purgeCharactersFromEvents() 
    {
        let names = Object.keys(this.gameEvents);
        for(let name of names)
        {
            let events = this.gameEvents[name];

            for(let ev of events)
            {
                for(let n of ev.npcs)
                {
                    if(n.isCreated())
                    {
                        n.tearDown();
                    }                    
                }

                ev.npcs = [];
            }
        }
    }

    private getCurrentEventForName(name: string, progress: number) : GameEvent | undefined
    {
        let events = this.gameEvents[name];
        let found =  events.find((ev: GameEvent) => {
            return ev.key == progress;
        });

        return found;
    }
}