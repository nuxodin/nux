import { mixin } from "../util/js.js";
import { serve } from "https://deno.land/std@v0.42.0/http/server.ts";
import { getNuxRequest } from "../request/request.js";
import { ensureDir } from "../util/nuxo.js";


export class NuxApp extends EventTarget {
	constructor(config={}){
        super();
		//this.config = Object.assign(defaults, config);
        this.config = config;
        if (!this.config.basePath) this.config.basePath = '/';
        if (!this.config.appPath) {
            var path = location.href.replace('file:///','')
            this.config.appPath = path.replace(/\/[^\/]+$/, '')
        }
        this.config.pubPath = this.config.appPath + '/pub';
        ensureDir(this.config.pubPath);

        this.modules = {};
    }
	async start(port){
        for await (const denoRequest of serve(":"+port)) {
            var response = await this.serve(denoRequest);
            if (response) denoRequest.respond(response);
		}
    }
    async serve(denoRequest){
        if (!denoRequest.url.startsWith(this.config.basePath)) return;
        var req = getNuxRequest(denoRequest);
        req.appUrlPart = denoRequest.url.substr(this.config.basePath.length);
        req.nuxApp = this;
//        if (this.config.basePath)


        //var event = new CustomEvent('fetch', req);
        //this.dispatchEvent(event);
        await this._modulesCall('serve', req);
        return await req.createResponse();
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
