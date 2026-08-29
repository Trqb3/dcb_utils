export default class FileManager {
    files: Map<any, any>;
    get(dir: string, foldersOnly?: boolean): import("fs").Dirent[];
}
