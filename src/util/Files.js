'use strict';

const fs = require('fs');
const path = require('path');

class Files {
    constructor() {}

    get(dir, foldersOnly = false) {
        let fileNames = [];
        const files = fs.readdirSync(dir, { withFileTypes: true });

        for (const file of files) {
            const filePath = path.join(dir, file.name);

            if (foldersOnly) {
                if (file.isDirectory()) {
                    fileNames.push(filePath);
                } else {
                    if (file.isFile()) {
                        fileNames.push(filePath);
                    }
                }
            }
        }

        return fileNames;
    }
}

module.exports = Files;