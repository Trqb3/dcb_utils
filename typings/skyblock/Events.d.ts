import { SkyBlockTime } from "./Time";
/**
 * The configuration for a Skyblock event.
 * @property key - The unique key for the event.
 * @property name - The name of the event.
 * @property pre_ping - The time before the event starts to send a notification.
 * @property duration - The duration of the event.
 */
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
 * Creates a new instance of SkyBlockEvents.
 * @param config The configuration for the event.
 * @example
 * const event = new SkyBlockEvents({ key: 'event1', name: 'Event 1', pre_ping: 60, duration: 3600 });
 * @returns The new SkyBlockEvents instance.
 * */
export default class SkyBlockEvents {
    config: EventConfig;
    constructor(config: EventConfig);
    /**
     * Checks if the event should be triggered at the given time.
     * @param sbTime The time to check against.
     * @returns boolean
     * @example
     * const ping = event.check(sbt.get(new Date()));
     * */
    check(sbTime: SkyBlockTime): boolean;
}
