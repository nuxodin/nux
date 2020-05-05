export const namespace = 'log';

import {Sha1} from "https://deno.land/std@v0.42.0/util/sha1.ts";

function sha1(string){
    const sha1 = new Sha1();
    sha1.update(string);
    return sha1.toString();
}


// export async function init(nuxApp){
//     await nuxApp.need('db')
//     await nuxApp.need('server')
// }

export async function serve(req) {
    // await nuxApp.need('db')
    const db = req.nuxApp.db;
    async function getLogPromise () {
        // let post = req.post;
        // if (post.includes('pw":"')) post = post.replace(/pw":"[^"]*/, 'pw":"-----'); // xhr-logn / change-pw
        // if (post.includes('"pw"'))  post = post.replace(/("pw"[^"]+")[^"]+"/, '$1-----"'); // post-login
        const getRowId = row => row.cell('id').value;
        const pUrlId = db.table('log_url').ensure({hash: sha1(req.url), url: req.url }).then(getRowId);
        const pRefId = db.table('log_url').ensure({hash: sha1(req.referer), url: req.header.referer ?? '' }).then(getRowId);
        const pIpId  = db.table('log_ip').ensure({ip: req.ip }).then(getRowId);
        const pUaId  = db.table('log_user_agent').ensure({user_agent: req.header['user-agent'] ?? '' }).then(getRowId);
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
    req.nuxApp.log = {
        id: getLogPromise()
    };
    req.response.body += 'log-id: ' + (await req.nuxApp.log.id) + '<br>\n';
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
