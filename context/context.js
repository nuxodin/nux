import { Cookies2 } from "./cookies.js";
import { serializeParams } from "./serializeParams.js";
import { Csp } from "./csp.js";
//import Introspected from "https://raw.githubusercontent.com/nuxodin/introspected/master/esm/introspected.js";

const pool = new WeakMap();

export function getContext(denoRequest){
	if (pool.has(denoRequest)) return pool.get(denoRequest);
	const request = new Context(denoRequest);
	pool.set(denoRequest, request);
	return request;
}

class Context {
	constructor(serverRequest){
		this.in = new Request(serverRequest);
		this.out = new Response();
		this.cookies = new Cookies2(this.in, this.out);
	}
}

class Request {
	constructor(oRequest){
		this.severRequest = oRequest;
		this.ip = oRequest.conn.remoteAddr.hostname;
		this.method = oRequest.method;
		// request-headers
		this.headers = oRequest.headers;
		// Url-object
		let proto = oRequest.conn.remoteAddr.transport === 'tcp' ? 'https:' : 'http:'; // ok?
		this.url = new URL(proto + '//' + this.headers.get('host') + oRequest.url);
		this.__get = serializeParams(this.url.searchParams); // beta
	}
}

class Response {
	constructor(){
		this.body = null;
		this.headers = new Headers();
		this.csp = new Csp();
		this.cspReport = new Csp();
		this.body = '';
	}
	toServerResponse() {
		// body
		let body = this.body;
		// header
		let x = this.csp.toString();
		if (x) this.headers.append('Content-Security-Policy', x);
		x = this.cspReport.toString();
		if (x) this.headers.append('Content-Security-Policy-Report-Only', x);
		// response
		return {
			status: this.status || 200,
			body,
			headers: this.headers,
		};
	}
	mixin(request) {
		if (request.headers) {
			for (let [key, value] of request.headers) {
				this.headers.set(key, value);
			}
		}
		if ('status' in request) this.status = request.status;
		if ('body' in request)   this.body = request.body;
	}
}
