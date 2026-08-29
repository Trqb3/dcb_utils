"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Creates a new instance of Events.
 * @param config The configuration for the event.
 * */
class Events {
    config;
    constructor(config) {
        this.config = config;
    }
    /**
     * Checks if the event should be triggered at the given time.
     * @param sbTime The time to check against.
     * @returns boolean
     * @example
     * const ping = event.check(sbt.get(new Date()));
     * */
    check(sbTime) {
        const matches = [
            this.config.day === null || this.config.day === sbTime.day,
            this.config.month === null || this.config.month === sbTime.month,
            this.config.year === null || this.config.year === sbTime.year,
            this.config.hour === null || this.config.hour === sbTime.hour,
            this.config.minute === null || this.config.minute === sbTime.minute
        ];
        return matches.every(Boolean);
    }
}
exports.default = Events;
