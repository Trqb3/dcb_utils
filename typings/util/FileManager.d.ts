import { Dirent } from 'fs';
export default class FileManager {
    files: Map<string, string>;
    get(dir: string, foldersOnly?: boolean): Dirent[];
}
