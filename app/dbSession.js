
export const namespace = 'sess';

export function init(app){
    app.sessionManager = new SessionManager(app.db);
}

export async function serve(ctx){
    ctx.session = await ctx.app.sessionManager.fromContext(ctx);
    await ctx.session.load();
    ctx.session.touch();
}

class SessionManager {
    constructor(db) {
        this.db = db;
        this.pool = {};
        this.maxAge = 60*60*24;
        this.memoryMaxAge = 40000;
    }
    async generate(){
        const hash = crypto.randomUUID();
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
        const valid = await session.isValid();
        if (!valid) session = await this.generate();
        return session;
    }
    async fromContext(ctx) {
        const hash = ctx.cookies.get('sess_id');
        const session = await this.ensure(hash);
        if (hash !== session.hash) console.log('new cookie', session.hash);
        ctx.cookies.set('sess_id', {
            value: session.hash,
            httpOnly: true,
            secure: true,
            maxAge: this.maxAge + 100,
            path: '/',
            //expires: new Date(),
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
        // if (this.lastAccess < Date.now() - this.maxAge * 1000) {
        //     return false;
        // }
        return true;// todo
    }
    setMaxAge(seconds){
        this.maxAge = seconds;
        this.touch();
    }
    async save(){ // todo: debounce
        const json = JSON.stringify(this.data);
        await this.manager.db.table('sess').row(this.id).set({
            data: json,
            max_age: this.maxAge,
            last_access: this.lastAccess.toString(),
        });
    }
    touch(){
        this.lastAccess = Date.now();
        setTimeout(()=>this.save(), 100)

        clearTimeout(this.memoryTimeout);
        this.memoryTimeout = setTimeout(()=>{
            delete this.manager.pool[this.hash];
        }, this.manager.memoryMaxAge); // hold in memory for the following requests, longer?
    }
    destroy(){
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
    db:{properties:{sess:{properties:{
        id:{
            format: 'uint32',
            colAutoincrement: true,
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
