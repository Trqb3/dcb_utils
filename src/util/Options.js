'use strict';

const { Client } = require("discord.js");
const Logger = require("../util/Logger");

/**
 * Optionen für die Datenbank Verbindung
 * @typedef {Object} DatabaseOptions
 * @property {string} host Hostname der Datenbank
 * @property {string} user Benutzername des Nutzers welche benutzt wird, um auf die Datenbank zuzugreifen
 * @property {number} port Port der Datenbank
 * */

/**
 * Angabe von Skyblock Zeit
 * @typedef {Object} SkyblockTimeFormat
 * @property {number} day Tag des Skyblock Kalenders
 * @property {number} month Monat des Skyblock Kalenders
 * @property {number} year Jahr des Skyblock Kalenders
 * @property {string} string Uhrzeit im Format HH:MM
 * @property {number} hour Stunde des Skyblock Kalenders
 * @property {number} minute Minute des Skyblock Kalenders
 * @property {number} poch Poche des Skyblock Kalenders
 * @property {function(): number} toUnix Funktion, welche die Skyblock Zeit in einen Unix Timestamp umwandelt
 * */

/**
 * Event Konfiguration
 * ___
 * Wenn ein optionaler Wert nicht angegeben wird, bedeutet dies, dass diese Eigenschaft nicht für die Überprüfung des Events verwendet wird
 * @typedef {Object} EventConfig
 * @property {string} key Schlüssel des Events
 * @property {string} name Name des Events
 * @property {number} pre_ping Zeit in Skyblock Minuten wie viele Minuten vorher das Event gepingt werden soll
 * @property {number} duration Dauer des Events in Skyblock Minuten
 * @property {string} [embed_emoji] Emoji, welches im Embed Header verwendet werden soll
 * @property {string} [embed_color] Farbe des Embeds
 * @property {string} [mayor_key] Schlüssel des Bürgermeisters, bei welchem das Event stattfindet
 * @property {string} [mayor_perk] Name des Perks, zu welchem das Event gehört
 * @property {number} [day] Tag des Events
 * @property {number} [month] Monat des Events
 * @property {number} [year] Jahr des Events
 * @property {number} [hour] Stunde des Events
 * @property {number} [minute] Minute des Events
 * */

/**
 * Discord Event Optionen
 * @typedef {Object} EventOptions
 * @property {string} dir Aktueller Dateipfad
 * @property {Client} client Discord Client
 * @property {Logger} logger Logger
 * */


/** @type {DatabaseOptions} */
const DatabaseOptions = {};

/**
 * Der Skyblock EPOCH Timestamp
 * */
const SB_EPOCH = 1560275700000;

const SkyblockTimeFormat = {
    toUnix() {
        const { day, month, year, hour, minute } = this;
        return Math.floor((SB_EPOCH + (year - 1) * 446400000 + (month - 1) * 37200000 + (day - 1) * 1200000 + hour * 50000 + minute * 50000 / 6) / 1000);
    }
};

/** @type {EventConfig} */
const EventConfig = {};

/** @type {EventOptions} */
const EventOptions = {};


module.exports.DatabaseOptions = DatabaseOptions;
module.exports.SkyblockTimeFormat = SkyblockTimeFormat;
module.exports.EventConfig = EventConfig;
module.exports.EventOptions = EventOptions;