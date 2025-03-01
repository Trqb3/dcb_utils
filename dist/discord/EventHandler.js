'use strict';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const path = require("path");
const Files = require("../util/Files");
const Logger = require("../util/Logger");
const { pathToFileURL } = require("url");
const fm = new Files();
class EventHandler {
    /**
     * Startet für jedes Element im Event Ordner einen Event Listener
     * @param {EventOptions} options
     * */
    constructor(options) {
        this.dir = options.dir;
        this.client = options.client;
        this.logger = options.logger;
        this._eventFolders = fm.get(this.dir, true);
        for (const eventFolder of this._eventFolders) {
            const eventFiles = fm.get(eventFolder, true);
            eventFiles.sort((a, b) => (a > b ? 1 : -1));
            const eventName = eventFolder.replace(/\\/g, '/').split('/').pop();
            if (eventName) {
                this.client.on(eventName, (arg) => __awaiter(this, void 0, void 0, function* () {
                    for (const eventFile of eventFiles) {
                        const { default: eventFunction } = yield Promise.resolve(`${pathToFileURL(eventFile).href}`).then(s => __importStar(require(s)));
                        yield (yield eventFunction)(arg, this.client, this.logger);
                    }
                }));
            }
        }
    }
}
