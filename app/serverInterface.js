export const namespace = 'serverInterface';

import { MultipartReader } from "https://deno.land/std@0.50.0/mime/multipart.ts";
//import { MultipartReader } from "https://raw.githubusercontent.com/denoland/deno/master/std/mime/multipart.ts";



export async function init(nuxApp){
    nuxApp.siApi = new Api();
}

export async function serve(ctx) {
    //if (ctx.method !== 'post') return;

    // var rawBody = await Deno.readAll(ctx.request.body)
    // const decoder = new TextDecoder();
    // const str = decoder.decode(rawBody);
    // console.log(str);
    let form = null;
    const contentType = ctx.in.headers.get('content-type');
    if (contentType && contentType.startsWith('multipart/form-data')) {
        const boundary = contentType.replace(/.*boundary=([^=]+)$/, '$1');
        //console.log(ctx.header)
        console.log(boundary);
        const reader = new MultipartReader(ctx.request.body, boundary);
        //const form = await reader.readForm()
        const form = await reader.readForm(1 << 20)
        //const form = await reader.readForm(20);
        console.log('form', form)

    }

    return;

    let ask = null;
    if (form) {
        ask = JSON.parse(form.askJSON);
    }
    ask = JSON.parse('{"serverInterface":[{"fn":"Setting","args":[{"crowd out":"","sidebar":"tree","tree_show_c":"","widget":{"data":{"access":"","access.grp":"","access.time":"","access.usr":"","classes":"","cont":"","divers":"","extended":"","media":"1","options":"1","preview":"","seo":"","sets":"","superuser":"","txts":"","urls":""},"_Es":{"set":[null]}}},["cms.frontend.1","custom"]]},{"fn":"cms_frontend_1::widget","args":["tree",{"pid":2}]}]}');
    if (ask['serverInterface']) {
        var returns = [];
        for (let item of ask['serverInterface']) {
            returns.push(this.siApi.call(item.fn, item.args));
        }
        ctx.out.headers.set('content-type', 'application/json; charset=UTF-8'); // ttodo: charset needed?
        ctx.out.body = returns;
		//Answer(returns);
        return false;
    }

}


class Api {
    constructor(){
        //this.app = app;
        this.tockenCheckNeeded = true;
        this.classes = {};
        this.fns = {};
    }
	call(fn, args) {

		let ret = null;
		let onAfter = false;
		let ok = true;

        // before
        /*
        var matches = fn.match(/(.+)::(.+)/)
		if (matches) {
            let clas = this.classes[matches[1]]
			let method = matches[2];
			let onBefore = clas.onBefore;
			onAfter = clas.onAfter;
			if (onBefore) {
				let aspectArgs = args;
				// array_unshift($aspectArgs, $method);
				// $v = call_user_func_array($onBefore, $aspectArgs);
                // $ok = $v !== false;
                let v = onBefore.call(aspectArgs);
                ok = v !== false;
			}
		}
        */
        this.tokenCheckNeeded && this.checkToken();
		this.tokenCheckNeeded = true; // ensure next api access checks token!

		if (ok) {
			//qg.fire('Api::before', {fn, args);
            if (!this.fns[fn]) {
                ret = {ok:false};
            } else {
                ret = this.fns[fn].call(args);
            }
			//qg.fire('Api::after', {fn, args, {return:ret});
		}

		// after
		if (onAfter) {
            // aspectArgs = args;
            // array_unshift($aspectArgs, $method);
            // call_user_func_array($onAfter, $aspectArgs);
            onAfter.call(aspectArgs);
		}
		return ret;
	}
    checkToken(req) {
return;
        //if (!isset(G()->ASK['serverInterface'])) return; // no request from the client, no need to test token
        if (!req.post.qgToken) {
            report.notice('hacking? qgToken not set');
            req.response(); // exit
        }
        if (req.post.qgToken !== qg.token) {
            // Answer([
            //     'cmsError' => 'Die Session ist nicht gültig, Bitte neu laden!',
            //     'info'     => 'qgToken nicht gültig'
            // ]);
        }
    }
}
