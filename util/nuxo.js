const { lstat, mkdir } = Deno;

export async function stat(path){
    try {
        return await Deno.stat(path);
    } catch (e) {
        return false;
    }
}


export async function ensureDir(dir){
    try {
        const fileInfo = await lstat(dir);
        if (!fileInfo.isDirectory) {
            throw new Error(`Ensure path exists, expected 'dir', got '${getFileInfoType(fileInfo)}'`);
        }
    } catch (err) {
        if (err instanceof Deno.errors.NotFound) {
            // if dir not exists. then create it.
            await mkdir(dir, { recursive: true });
            return;
        }
        throw err;
    }
}