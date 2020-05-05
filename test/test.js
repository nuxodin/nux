
import {NuxApp} from '../app/app.js';

var app = new NuxApp({
    basePath: '/',
    db: {
        hostname: "127.0.0.1",
        username: "root",
        password: "",
        db: "v7_deno",
    }
});

await app.need(import('../app/fileServer.js'));
await app.need(import('../app/db.js'));
await app.need(import('../app/log.js'));
await app.need(import('../app/dbSession.js'));
await app.need(import('../app/user.js'));
await app.need(import('../app/serverInterface.js'));
await app.init();
await app.start(91);








/*
import { serve } from "https://deno.land/std@v0.42.0/http/server.ts";

var app1 = new NuxApp({basePath: '/x/'});
await app1.need(import('../app/fileServer.js'));

var app2 = new NuxApp({basePath: '/y/'});
await app2.need(import('../app/fileServer.js'));

const s = serve({ port: 91 });
for await (const req of s) {

    var response = await app1.serve(req);
    if (response) req.respond(response);

    var response = await app2.serve(req);
    if (response) req.respond(response);
}
*/
