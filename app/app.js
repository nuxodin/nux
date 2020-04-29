import {mixin} from "../util/js.js";
import {serve} from "https://deno.land/std@v0.41.0/http/server.ts";
import {getNuxRequest} from "../request/request.js";


export class NuxApp extends EventTarget {
	constructor(config={}){
        super();
		//this.config = Object.assign(defaults, config);
        this.config = config;
        this.modules = {};
    }
	async start(port){
        for await (const denoRequest of serve(":"+port)) {
            var response = await this.serve(denoRequest);
            denoRequest.respond(response);
		}
    }
    async serve(denoRequest){
        var req = getNuxRequest(denoRequest);
        req.nuxApp = this;
        //await req.initSession();
        //var event = new CustomEvent('fetch', req);
        //this.dispatchEvent(event);
        await this._moduleServe(req);
        return req.createResponse();
    }
    async _moduleServe(req){
        for (let module in this.modules) {
            let exports = this.modules[module];
            if (!exports.serve) continue;
            for (let pattern in exports.serve) {
                var matchesPattern = pattern === '*' || 0;
                //if (!req.match(pattern)) continue;
                if (!matchesPattern) continue;
                var stop = await exports.serve[pattern](req);
                if (stop !== undefined) return;
            }
        }
    }
    async need(module) {
        var exports = await module;
        if (exports.init) await exports.init(this);
        this.modules[exports.namespace] = exports;
    }
    init() {
        this.schema = {};
        for (let module in this.modules) {
            let exports = this.modules[module];
            if (!exports.schema) continue;
            mixin(exports.schema, this.schema, false, true);
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
