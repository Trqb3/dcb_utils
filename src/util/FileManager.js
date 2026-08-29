"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
class FileManager {
    files = new Map();
    get(dir, foldersOnly = false) {
        const files = (0, fs_1.readdirSync)(dir, { withFileTypes: true });
        for (const file of files) {
            const filePath = (0, path_1.join)(dir, file.name);
            if (file.isDirectory()) {
                if (!foldersOnly) {
                    this.files.set(file.name, filePath);
                }
                this.get(filePath, foldersOnly);
            }
            else {
                this.files.set(file.name, filePath);
            }
        }
        return files;
    }
}
exports.default = FileManager;
