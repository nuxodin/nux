import {server as FileServer} from 'https://raw.githubusercontent.com/nuxodin/nux_file_server/master/server.js';

export const serve = {
    '*':(req)=>{
        if (!req.Url.path.startsWidth( req.nuxApp.url )) return
        return await FileServer.serve(req);
    },
}
