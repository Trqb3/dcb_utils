import { SkyblockTime } from "./Time";
export interface EventConfig {
    key: string;
    name: string;
    pre_ping: number;
    duration: number;
    mayor_key?: string;
    mayor_perk?: string;
    day?: number;
    month?: number;
    year?: number;
    hour?: number;
    minute?: number;
}
/**
 * Creates a new instance of Events.
 * @param config The configuration for the event.
 * */
export default class Events {
    config: EventConfig;
    constructor(config: EventConfig);
    /**
     * Checks if the event should be triggered at the given time.
     * @param sbTime The time to check against.
     * @returns boolean
     * @example
     * const ping = event.check(sbt.get(new Date()));
     * */
    check(sbTime: SkyblockTime): boolean;
}
