import { serveFile } from "https://deno.land/std@0.56.0/http/file_server.ts";


import {default as terser} from 'https://cdn.pika.dev/terser@^4.6.13';

/** Class for translating cdn => locally */
export class Uncdn {

    /** Create a uncdn-manager
     * @param options options:
     * @param options.cacheDir Where files are cached
     * @param options.rootUrl
     * @param options.openProxy proxy all requests: really dangerous!
     */
    constructor(options){
        this.cacheDir = options.cacheDir;
        this.rootUrl = options.rootUrl || '/uncdn/';
        this.openProxy = options.openProxy;
    }

    /**
     * @param {string} url - rewrites the url for fetching locally
     * @param {*} options
     */
    url(url, options={}) {
        const localPart = this._urlToLocalPart(url, options);
        //return this.rootUrl + url;
        return this.rootUrl + localPart;
    }

    /**
     * get the response from uncdn if managed by uncdn
     * @param {object} req - deno-server-request
     * @return {object|false} deno-server-response
     */
    async requestToResponse(req) {
        if (!req.url.startsWith(this.rootUrl)) return false;
        let cdnUrl = req.url.substr(this.rootUrl.length);
        try {
            var path = this._path(cdnUrl);
            const response = await serveFile(req, path);
            response.headers.set("content-type", 'text/javascript');
            response.headers.set("cache-control", 'public, max-age=31536000'); // immutable?
            return response;
        } catch (e) { // not found
            if (this.openProxy) {
                console.warn('warning, this is very dangerous! deactivate with option openProxy:false  loading: '+cdnUrl);
                await this._ensure(cdnUrl, {/* options? */}); // dangerous!!!!
            }
            return false;
        }
    }
    async serve(req) {
        var resp = this.requestToResponse(req);
        if (!resp) return false;
        //req.response(resp); // second argument?????
        req.response(resp, {}); // zzz
    }
    _urlToLocalPart(url, options) {
        let localPart = url; //.replace(/https:\/\//,'');
        if (options.bundle) localPart = localPart.replace(/\.js$/,'.bndl.js');
        if (options.minify) localPart = localPart.replace(/\.js$/,'.min.js');
        return localPart;
    }
    /* private */
    async _ensure(url, options){
        var path = this._path( this._urlToLocalPart(url, options) );
        try {
            await Deno.stat(path);
        } catch (e) { // not found
            let contents;
            if (options.bundle) { // as a bundle
                let maybeDiagnostics1;
                [maybeDiagnostics1, contents] = await Deno.bundle(url);
            } else {
                const response = await fetch(url);
                contents = await response.text();
                contents = contents.replace(/(import .+ from ["'])(http[^"]+)(["'])/g, (full, $1, $2, $3)=>{
                    return $1 + this.url($2) + $3;
                });

                contents = terser.minify(contents).code;

            }
            /*
            todo: parseContent to find linked files: // dangerous?
            todo?: use a options to enable/disable
            js:
            */
            Deno.writeFile(path, new TextEncoder().encode(contents) );
        }
    }
    _path(url) {
        return this.cacheDir + '/' + encodeURIComponent(url); // is it save to use encodeURIComponent?
    }
}
