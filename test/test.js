import { serve } from "https://deno.land/std@v0.36.0/http/server.ts";

import {NuxApp} from '../app/app.js';
var app = new NuxApp({
    db: {
        hostname: "127.0.0.1",
        username: "root",
        password: "",
        db: "v7_deno",
    }
})

await app.need(import('../app/db.js'));
await app.need(import('../app/log.js'));
await app.need(import('../app/dbSession.js'));
await app.init();
await app.start(91);

/*
const s = serve({ port: 91 });
for await (const req of s) {
    var response = await app.serve(req);
    response.body =+ 'log: '
    req.respond(response);
}
*/



/*
import {NuxApp} from '../app/app.js';
var app = new NuxApp({
    pub: import.meta.url + '../pub/',
    pri: import.meta.url + '../pri/',
})
app.use(db);
app.use(log);
app.use(fileServer);
app.start();
*/