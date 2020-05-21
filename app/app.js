import { mixin } from "../util/js.js";
import { serve, serveTLS } from "https://deno.land/std@0.51.0/http/server.ts";
import { getContext } from "../context/context.js";
import { ensureDir } from "../util/nuxo.js";

export class NuxApp extends EventTarget {
	constructor(config={}){
        super();
		//this.config = Object.assign(defaults, config);
        this.config = config;
        if (!this.config.basePath) this.config.basePath = '/';
        // if (!this.config.appPath) {
        //     var path = location.href.replace('file:///','')
        //     this.config.appPath = path.replace(/\/[^\/]+$/, '')
        // }
        this.config.pubPath = this.config.appPath + '/pub';
        this.config.cacheDir = this.config.appPath + '/cache';
        ensureDir(this.config.pubPath);
        ensureDir(this.config.cacheDir);
        this.modules = {};
    }
	async start(port){
        var myPath = new URL(import.meta.url).pathname.substr(1);
        const httpsOptions = {
            hostname: "localhost",
            port: 88,
            certFile: myPath + '/../app/test_localhost.cert',
            keyFile: myPath + '/../app/test_localhost.key',
        };
        [[serve, ':'+port]/*, [serveTLS, httpsOptions]*/].forEach(async ([fn, arg])=>{
            for await (const denoRequest of fn(arg)) {
                var response = await this.serve(denoRequest);
                if (response) denoRequest.respond(response);
            }
        });
        console.log('server listen on port '+port)
        // for await (const denoRequest of serve(":"+port)) {
        //     var response = await this.serve(denoRequest);
        //     if (response) denoRequest.respond(response);
        // }
    }
    async serve(denoRequest){
        if (!denoRequest.url.startsWith(this.config.basePath)) return;
        var ctx = getContext(denoRequest);
        ctx.appUrlPart = denoRequest.url.substr(this.config.basePath.length);
        ctx.app = this;
        await this._modulesCall('serve', ctx);
        return await ctx.out.toServerResponse();
    }
    async _modulesCall(what, arg){
        for (let module in this.modules) {
            let exports = this.modules[module];
            if (!exports[what]) continue;
            var stop = await exports[what].call(this, arg);
            if (stop !== undefined) return;
        }
    }
    async need(module) {
        var exports = await module;
        if (exports.init) await exports.init(this);
        this.modules[exports.namespace] = exports;
    }
    async init() {
        this.schema = {};
        for (let module in this.modules) {
            let exports = this.modules[module];
            if (!exports.schema) continue;
            const schema = await exports.schema;
            mixin(schema, this.schema, false, true);
        }

//        await Deno.create(this.config.appPath + '/config.json');
        const configJson = await Deno.readTextFile(this.config.appPath + '/config.json');
        const config = JSON.parse(configJson);
        console.log(config)



        for (let module in this.modules) {
            let exports = this.modules[module];
            if (!exports.prepare) continue;
            exports.prepare(this);
        }
    }
}




/*
app = new NuxApp({port:90});
app.addEventListener('fetch',function(e){
	e.req.response('asdf');
	e.stopImmediatePropagation();
});
app.addEventListener('fetch',function(e){
	e.waitUntil(async ()=>{
		await fileServer.listen(e.req);
	});
});
app.listen();
*/
