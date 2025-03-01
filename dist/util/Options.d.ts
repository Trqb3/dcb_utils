/**
 * Optionen für die Datenbank Verbindung
 */
export type DatabaseOptions = {
    /**
     * Datenbanken auf welche zugegriffen werden sollen
     */
    databases: string | string[];
    /**
     * Hostname der Datenbank
     */
    host: string;
    /**
     * Benutzername des Nutzers welche benutzt wird, um auf die Datenbank zuzugreifen
     */
    user: string;
    /**
     * Port der Datenbank
     */
    port: number;
};
/**
 * Angabe von Skyblock Zeit
 */
export type SbTimeFormat = {
    /**
     * Tag des Skyblock Kalenders
     */
    day: number;
    /**
     * Monat des Skyblock Kalenders
     */
    month: number;
    /**
     * Jahr des Skyblock Kalenders
     */
    year: number;
    /**
     * Uhrzeit im Format HH:MM
     */
    string: string;
    /**
     * Stunde des Skyblock Kalenders
     */
    hour: number;
    /**
     * Minute des Skyblock Kalenders
     */
    minute: number;
    /**
     * Poche des Skyblock Kalenders
     */
    poch: number;
};
/**
 * Event Konfiguration
 * ___
 * Wenn ein optionaler Wert nicht angegeben wird, bedeutet dies, dass diese Eigenschaft nicht für die Überprüfung des Events verwendet wird
 */
export type EventConfig = {
    /**
     * Schlüssel des Events
     */
    key: string;
    /**
     * Name des Events
     */
    name: string;
    /**
     * Zeit in Skyblock Minuten wie viele Minuten vorher das Event gepingt werden soll
     */
    pre_ping: number;
    /**
     * Dauer des Events in Skyblock Minuten
     */
    duration: number;
    /**
     * Emoji, welches im Embed Header verwendet werden soll
     */
    embed_emoji?: string | undefined;
    /**
     * Farbe des Embeds
     */
    embed_color?: string | undefined;
    /**
     * Schlüssel des Bürgermeisters, bei welchem das Event stattfindet
     */
    mayor_key?: string | undefined;
    /**
     * Name des Perks, zu welchem das Event gehört
     */
    mayor_perk?: string | undefined;
    /**
     * Tag des Events
     */
    day?: number | undefined;
    /**
     * Monat des Events
     */
    month?: number | undefined;
    /**
     * Jahr des Events
     */
    year?: number | undefined;
    /**
     * Stunde des Events
     */
    hour?: number | undefined;
    /**
     * Minute des Events
     */
    minute?: number | undefined;
};
/**
 * Discord Event Optionen
 */
export type EventOptions = {
    /**
     * Dateipfad zu dem Ordner in welchem die Eventdateien liegen
     */
    dir: string;
    /**
     * Discord Client
     */
    client: Client;
    /**
     * Logger
     */
    logger: Logger;
};
import { Client } from "discord.js";
import Logger = require("../util/Logger");
