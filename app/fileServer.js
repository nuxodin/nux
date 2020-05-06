//import {server as FileServer} from 'https://raw.githubusercontent.com/nuxodin/nux_file_server/master/server.js';
import {FileServer} from '../../nux_file_server/server.js';

export async function init(app){
    app.fileServer = new FileServer(app.config.pubPath, app.config.basePath);
}

export async function serve(ctx){
    if (!ctx.in.url.pathname.startsWith( this.config.basePath )) return;
    let found = await this.fileServer.serve(ctx);
    return found;
}
