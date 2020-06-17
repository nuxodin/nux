
//import 'https://raw.githubusercontent.com/nuxodin/deno-require/master/require.js?10';

import {NuxApp} from '../app/app.js';

var app = new NuxApp({
    basePath: '/',
    appPath: import.meta.url.replace('file:///','').replace(/\/[^\/]+$/, ''),
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
await app.need(import('../app/cms.js'));
await app.need(import('../app/uncdn.js'));
await app.need(import('../app/moduleManager.js'));
await app.need({
    namespace: 'xxx',
    serve: async function(ctx){
        var app = ctx.app;
        ctx.out.headers.set("content-type", "text/html; charset=utf-8");
        ctx.out.body += `
            <!DOCTYPE html>
            <html lang="en">
                <head>
                    <script type=module>
                        import {render, html, svg} from '${app.uncdn.url('https://unpkg.com/uhtml@1.10.0/esm/index.js?module')}';
                        render(uhtml, html\`<h1>Hello 👋 uncdn</h1>\`);
                    </script>
                <body>
                    <div id=uhtml>reload some times to wait for files copied from cdn</div>
                    <p>log-id: ${await ctx.log.id}<br></p>
                    <p>sess-hash: ${await ctx.session.hash}<br></p>
            `;
            //ctx.out.body += html.dump(this);
        }
})
await app.init();
await app.start(93);



/*
import { serve } from "https://deno.land/std@0.56.0/http/server.ts";

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
