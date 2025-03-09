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

export default class Events {
    public config: EventConfig;

    /**
     * Creates a new instance of Events.
     * @param config The configuration for the event.
     * */
    constructor(config: EventConfig) {
        this.config = config;
    }

    /**
     * Checks if the event should be triggered at the given time.
     * @param sbTime The time to check against.
     * @returns boolean
     * @example
     * const ping = event.check(sbt.get(new Date()));
     * */
    public check(sbTime: SkyblockTime): boolean {
        const matches: boolean[] = [
            this.config.day === null || this.config.day === sbTime.day,
            this.config.month === null || this.config.month === sbTime.month,
            this.config.year === null || this.config.year === sbTime.year,
            this.config.hour === null || this.config.hour === sbTime.hour,
            this.config.minute === null || this.config.minute === sbTime.minute
        ];

        return matches.every(Boolean);
    }
}