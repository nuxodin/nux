import { Uncdn } from '../uncdn/main.js';
import { ensureDir } from "../util/nuxo.js";

export const namespace = 'uncdn';

export function init(app){
    const cacheDir = app.config.cacheDir + '/uncdn';
    ensureDir(cacheDir);
    app.uncdn = new Uncdn({
        rootUrl: app.config.basePath + 'uncdn/',
        cacheDir: cacheDir,
        openProxy: true
    });
}

export async function serve(ctx) {
    const resp = await this.uncdn.requestToResponse(ctx.in.severRequest);
    if (resp) {
        ctx.out.mixin(resp);
        return true;
    }
}
