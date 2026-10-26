import { readdirSync } from 'fs';
import { join } from 'path';
export default class FileManager {
    files = new Map();
    get(dir, foldersOnly = false) {
        const files = readdirSync(dir, { withFileTypes: true });
        for (const file of files) {
            const filePath = join(dir, file.name);
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
