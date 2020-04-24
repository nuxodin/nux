import DB from "file:D://workspace/github/nux_db/DB.js";
import {getNuxRequest} from "file:D://workspace/github/nux_app/request.js";
import {server as FileServer} from 'https://raw.githubusercontent.com/nuxodin/nux_file_server/master/server.js';
import { serve } from "./user";
import { schema } from "./user";



export class NuxApp extends NuxEventTarget {
	constructor(options={}){
		this.options = Object.assign(defaults, options);
        this.config = config;
        const client = await new MysqlClient().connect(this.config.db);
        this.db = new DB(client);
	}
	listen(){
		for await (let denoRequest of serve(":"+this.options.port)) {
            var req = getNuxRequest(denoRequest);
            req.nuxApp = this;
			await req.initSession();

            var event = new CustomEvent('fetch', req);
			this.fire(event);

            var result = this._moduleServe(req);
            if (result) {
                req.respond();
                continue;
            }

			let body = req.url;
			req.respond({ body });
		}
    }
    _moduleServe(req){
        for (let exports in this.modules) {
            if (!exports.serve) continue;
            for (let pattern in exports.serve) {
                if (!req.match(pattern)) continue;
                var result = await exports.serve[pattern](req);
                if (result !== undefined) return result;
            }
        }
    }
    async need(module){
        var exports = await import(module);
        this.modules[module] = exports;
    }
    init() {
        this.schema = {};
        for (exports in this.modules) {
            js.mixin(exports.scheme, this.scheme, {ifNot:true});
        }
        //parseSchema()
    }
}


class NuxEventTarget extends EventTarget {
	on(event, options){
		return this.addEventListener(event, options);
	}
	off(event, options) {
		return this.removeEventListener(event, options);
	}
	fire(event) {
		this.dispatchEvent(event);
	}
}



/*
app = new NuxApp({port:90});
app.on('fetch',function(e){
	e.req.response('asdf');
	e.stopImmediatePropagation();
});
app.on('fetch',function(e){
	e.waitUntil(async ()=>{
		await fileServer.listen(e.req);
	});
});
app.listen();
*/
