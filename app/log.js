export const namespace = 'log';

import {Sha1} from "https://deno.land/std@0.51.0/hash/sha1.ts";

function sha1(string){
    const sha1 = new Sha1();
    sha1.update(string.toString());
    return sha1.toString();
}


// export async function init(nuxApp){
//     await nuxApp.need('db')
//     await nuxApp.need('server')
// }

export async function serve(ctx) {
    // await nuxApp.need('db')
    const db = ctx.app.db;
    async function getLogPromise () {
        // let post = ctx.post;
        // if (post.includes('pw":"')) post = post.replace(/pw":"[^"]*/, 'pw":"-----'); // xhr-logn / change-pw
        // if (post.includes('"pw"'))  post = post.replace(/("pw"[^"]+")[^"]+"/, '$1-----"'); // post-login
        const referer = ctx.in.headers.get('referer') ?? '';
        const url     = ctx.in.url.toString();
        const ua      = ctx.in.headers.get('user-agent') ?? '';
        const getRowId = row => row.cell('id').value;
        const pUrlId = db.table('log_url').ensure({hash: sha1(url), url:url }).then(getRowId);
        const pRefId = db.table('log_url').ensure({hash: sha1(referer), url: referer }).then(getRowId);
        const pIpId  = db.table('log_ip').ensure({ip: ctx.in.ip }).then(getRowId);
        const pUaId  = db.table('log_user_agent').ensure({user_agent:ua}).then(getRowId);
        let [url_id, referer_id, ip_id, ua_id] = [await pUrlId, await pRefId, await pIpId, await pUaId];
        const row = await db.table('log').insert({
            time: Date.now(),
            user_agent_id: ua_id,
            url_id,
            referer_id,
            ip_id,
            //post,
        });
        return await row.cell('id').value;
    }
    ctx.log = {
        id: getLogPromise()
    };
}

export const schema = {
    db:{properties:{
        log:{properties:{
            id:            { colAutoincrement:true, },
            time:          { format: 'date-time', },
            user_agent_id: { $parent: 'log_user_agent' },
            url_id:        { $parent: 'log_url' },
            referer_id:    { $parent: 'log_url' },
            ip_id:         { $parent: 'log_ip' },
            client_id:     { $parent: 'client' },
        }},
        log_ip:{properties:{
            id: { colAutoincrement:true, },
            ip: { maxLength: 39, $index: 'unique' },
        }},
        log_url:{properties:{
            id:    { colAutoincrement:true, },
            hash:  { maxLength: 40, $index:true },
            url:   { text: 40 },
        }},
        log_user_agent:{properties:{
            id:         { colAutoincrement:true, },
            user_agent: { index:true },
        }},
    }}
}
