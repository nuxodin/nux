import {Sha1} from "https://deno.land/std/ws/sha1.ts";

function sha1(string){
    const sha1 = new Sha1();
    sha1.update(string);
    return sha1.toString();
}


export async function init(nuxApp){
    nuxApp.sessionManager = new SessionManager(nuxApp.db);
}


export const namespace = 'sess';

export const serve = {
    '*': async req => {
        //if (req.url === '/favicon.ico') return true;
        console.log(req.url)
        req.session = await req.nuxApp.sessionManager.fromRequest(req);
        await req.session.load();
        req.session.touch();

        req.response.body += 'session-id: ' + req.session.hash;
    },
}

export const unserve = {
    '*': async req => {
        req.session.close();
    },
}



class SessionManager {
    constructor(db) {
        this.db = db;
        this.pool = {};
        this.maxAge = 60*60*24;
        this.memoryMaxAge = 4000;
    }
    async generate(){
        let hash = sha1(Math.random());
        await this.db.table('sess').insert({hash});
        return this.get(hash);
    }
    get(hash) {
        if (!this.pool[hash]) this.pool[hash] = new Session(this, hash);
        return this.pool[hash];
    }
    async ensure(hash) {
        if (!hash) return await this.generate();
        let session = this.get(hash);
        let valid = await session.isValid();
        if (!valid) session = await this.generate();
        return session;
    }
    async fromRequest(req) {
        let hash = req.cookie.get('sess_id');
        let session = await this.ensure(hash);
        if (hash !== session.hash) console.log('new cookie', session.hash);
        req.cookie.set('sess_id', {
            value: session.hash,
            httpOnly: true,
            secure: true,
            maxAge: this.maxAge + 100,
            //expires: new Date(),
            //path:
            //sameSite:
        });
        return session;
    }
}

class Session {
    constructor (manager, hash){
        this.manager = manager;
        this.hash = hash;
        this.valid = undefined;
        this.loaded = undefined;
        this.maxAge = manager.maxAge;
    }
    async load(){
        if (this.loaded !== undefined) return;
        const rows = await this.manager.db.table('sess').rows({hash:this.hash});
        const row = await rows[0].values();
        if (!row) {
            this.valid = false;
            this.loaded = true;
        } else {
            this.loaded = true;
            this.id = row.id;
            this.data = JSON.parse(row.data || '{}');
            this.maxAge = row.max_age;
            this.lastAccess = row.last_access;
        }
    }
    async isValid(){
        await this.load();
        if (this.valid !== undefined) return this.valid;
        return true; // todo
        if (this.lastAccess < Date.now() - this.maxAge * 1000) {
            return false;
        }
        return true;
    }
    setMaxAge(seconds){
        this.maxAge = seconds;
        this.touch();
    }
    async save(){ // todo: debounce
        let json = JSON.stringify(this.data);
        console.log('save session', this.hash);

        await this.manager.db.table('sess').row(this.id).set({
            data: json,
            max_age: this.maxAge,
            last_access: this.lastAccess,
        });
    }
    touch(){
        this.lastAccess = Date.now();
        setTimeout(()=>this.save(), 100)
        clearTimeout(this.memoryTimeout);
        this.memoryTimeout = setTimeout(()=>{
            console.log('remove from pool', this.hash)
            delete this.manager.pool[this.hash];
        }, this.manager.memoryMaxAge); // hold in memory for the following requests, longer?
    }
    destroi(){
        this.id = false;
        this.data = null;
        this.hash = null;
        this.db.table('sess').update({ // save
            id: this.id,
            hash: null
        });
    }
}



export const schema = {
    db:{items:{sess:{items:{
        id:{
            format: 'uint32',
            $autoincrement: true,
        },
        hash:{
            maxLength: 64,
            charset:'ascii',
            column: {
                index:'unique',
            }
        },
        last_access:{
            format: 'date-time',
            index: true,
        },
        max_age:{
            format: 'uint32',
        },
        data:{
            format: 'json',
        },
    }}}}
}
